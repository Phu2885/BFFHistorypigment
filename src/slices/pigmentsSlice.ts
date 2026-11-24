import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Pigment } from "../api/Api";
import { PIGMENTS_MOCK } from "../modules/mock";
import { IS_PAGES } from "../modules/env";
import type { RootState } from "../store";

// Слайс домена услуг: фильтр поглощения, плитка и лента пигментов.
interface PigmentsState {
  absorptionFilter: string; // значение фильтра хранится в Redux и уходит в запрос
  list: Pigment[];
  feedItem: Pigment | null;
  loading: boolean;
  isMock: boolean; // данные из mock-коллекции (бэкенд недоступен, только гость)
  error: string | null;
}

export const DEFAULT_ABSORPTION_FILTER = "1.0";

const initialState: PigmentsState = {
  absorptionFilter: DEFAULT_ABSORPTION_FILTER,
  list: [],
  feedItem: null,
  loading: false,
  isMock: false,
  error: null,
};

const filterMock = (filter: string) => {
  const max = parseFloat(filter);
  return isNaN(max)
    ? PIGMENTS_MOCK
    : PIGMENTS_MOCK.filter((p) => (p.absorption ?? 0) <= max);
};

// 1. GET /api/pigments — плитка с фильтром по коэффициенту поглощения
export const fetchPigmentsList = createAsyncThunk<
  { data: Pigment[]; isMock: boolean },
  void,
  { state: RootState; rejectValue: string }
>("pigments/fetchPigmentsList", async (_, { getState, rejectWithValue }) => {
  const { pigments, user } = getState();
  const filter = parseFloat(pigments.absorptionFilter);
  // GitHub Pages: бэкенда нет, сразу берём mock-коллекцию с тем же фильтром
  if (IS_PAGES) return { data: filterMock(pigments.absorptionFilter), isMock: true };
  try {
    const { data } = await api.pigments.getPigmentsList(isNaN(filter) ? {} : { filter });
    return { data: data.data ?? [], isMock: false };
  } catch {
    if (!user.isAuthenticated) {
      return { data: filterMock(pigments.absorptionFilter), isMock: true };
    }
    return rejectWithValue("Не удалось загрузить пигменты");
  }
});

// 2. GET /api/pigments/feed — лента: первый пигмент, по id или следующий
export const fetchPigmentsFeed = createAsyncThunk<
  { data: Pigment; isMock: boolean },
  { id?: number; next?: boolean } | undefined,
  { state: RootState; rejectValue: string }
>("pigments/fetchPigmentsFeed", async (params, { getState, rejectWithValue }) => {
  const { id, next } = params ?? {};
  const fromMock = () => {
    const index = PIGMENTS_MOCK.findIndex((p) => p.id === id);
    return next
      ? PIGMENTS_MOCK[(index + 1) % PIGMENTS_MOCK.length]
      : PIGMENTS_MOCK[Math.max(index, 0)];
  };
  if (IS_PAGES) return { data: fromMock(), isMock: true };
  try {
    const { data } = await api.pigments.getPigmentsFeed({ id, next });
    if (!data.data) throw new Error("empty feed");
    return { data: data.data, isMock: false };
  } catch {
    if (!getState().user.isAuthenticated) {
      return { data: fromMock(), isMock: true };
    }
    return rejectWithValue("Лента недоступна");
  }
});

// 6. DELETE /api/pigments/{id} — логическое удаление своего пигмента
export const deletePigment = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: string }
>(
  "pigments/deletePigment",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.pigments.deletePigment(id);
      await dispatch(fetchPigmentsList());
      return id;
    } catch {
      return rejectWithValue("Не удалось удалить пигмент");
    }
  },
);

// 7. POST /api/pigments/{id}/like — поставить (1) или отменить (0) лайк
export const togglePigmentLike = createAsyncThunk<
  { id: number; likes: number; is_like: boolean },
  { id: number; value: 0 | 1 },
  { rejectValue: string }
>("pigments/togglePigmentLike", async ({ id, value }, { rejectWithValue }) => {
  try {
    const { data } = await api.pigments.likePigment(id, { value });
    return { id, likes: data.likes ?? 0, is_like: Boolean(data.is_like) };
  } catch {
    return rejectWithValue("Не удалось поставить лайк");
  }
});

const pigmentsSlice = createSlice({
  name: "pigments",
  initialState,
  reducers: {
    setAbsorptionFilter(state, action: PayloadAction<string>) {
      state.absorptionFilter = action.payload;
    },
    resetPigmentsFilter(state) {
      state.absorptionFilter = DEFAULT_ABSORPTION_FILTER;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPigmentsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPigmentsList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.isMock = action.payload.isMock;
      })
      .addCase(fetchPigmentsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка загрузки";
      })
      .addCase(fetchPigmentsFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPigmentsFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feedItem = action.payload.data;
        state.isMock = action.payload.isMock;
      })
      .addCase(fetchPigmentsFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка загрузки";
      })
      .addCase(deletePigment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePigment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deletePigment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка удаления";
      })
      .addCase(togglePigmentLike.pending, (state) => {
        state.loading = true;
      })
      .addCase(togglePigmentLike.fulfilled, (state, action) => {
        state.loading = false;
        const { id, likes, is_like } = action.payload;
        if (state.feedItem?.id === id) {
          state.feedItem.likes = likes;
          state.feedItem.is_like = is_like;
        }
        const card = state.list.find((p) => p.id === id);
        if (card) {
          card.likes = likes;
          card.is_like = is_like;
        }
      })
      .addCase(togglePigmentLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка лайка";
      });
  },
});

export const { setAbsorptionFilter, resetPigmentsFilter } = pigmentsSlice.actions;
export default pigmentsSlice.reducer;
