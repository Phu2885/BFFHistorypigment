import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { CreatePigmentDraftPayload, Pigment, PigmentPublishRequest } from "../api/Api";

// Слайс страницы «Добавление пигмента»: черновик и его публикация.
interface PigmentDraftState {
  draft: Pigment | null;
  loading: boolean;
  error: string | null;
}

const initialState: PigmentDraftState = {
  draft: null,
  loading: false,
  error: null,
};

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

// 3. GET /api/pigments/draft — черновик текущего пользователя (id не передаётся)
export const fetchPigmentDraft = createAsyncThunk<Pigment | null, void, { rejectValue: string }>(
  "pigmentDraft/fetchPigmentDraft",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.pigments.getPigmentDraft();
      return data.data ?? null;
    } catch (e) {
      return rejectWithValue(errorMessage(e, "Не удалось загрузить черновик"));
    }
  },
);

// 4. POST /api/pigments — черновик с названием, изображением и видео (multipart, MinIO)
export const createPigmentDraft = createAsyncThunk<
  Pigment,
  CreatePigmentDraftPayload,
  { rejectValue: string }
>("pigmentDraft/createPigmentDraft", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.pigments.createPigmentDraft(payload);
    return data.data as Pigment;
  } catch (e) {
    return rejectWithValue(errorMessage(e, "Не удалось создать черновик"));
  }
});

// 5. PUT /api/pigments/{id}/publish — публикация с описанием и коэффициентами R и A
export const publishPigmentDraft = createAsyncThunk<
  Pigment,
  { id: number; data: PigmentPublishRequest },
  { rejectValue: string }
>("pigmentDraft/publishPigmentDraft", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.pigments.publishPigmentDraft(id, data);
    return response.data.data as Pigment;
  } catch (e) {
    return rejectWithValue(errorMessage(e, "Не удалось опубликовать пигмент"));
  }
});

const pigmentDraftSlice = createSlice({
  name: "pigmentDraft",
  initialState,
  reducers: {
    resetPigmentDraft() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPigmentDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPigmentDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.draft = action.payload;
      })
      .addCase(fetchPigmentDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(createPigmentDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPigmentDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.draft = action.payload;
      })
      .addCase(createPigmentDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(publishPigmentDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishPigmentDraft.fulfilled, (state) => {
        state.loading = false;
        state.draft = null;
      })
      .addCase(publishPigmentDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { resetPigmentDraft } = pigmentDraftSlice.actions;
export default pigmentDraftSlice.reducer;
