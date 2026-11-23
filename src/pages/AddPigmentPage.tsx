import "./Forms.css";
import { useEffect, useMemo, useState, type FC, type FormEvent, type ReactNode } from "react";
import { Alert } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import type { Pigment } from "../api/Api";
import { ROUTES } from "../Routes";
import { DEFAULT_IMAGE, mediaUrl } from "../modules/media";
import { createPigmentDraft, fetchPigmentDraft, publishPigmentDraft } from "../slices/pigmentDraftSlice";
import { useAppDispatch, useAppSelector } from "../store";

// URL для предпросмотра выбранного файла с диска
const useObjectUrl = (file?: File) => {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
};

interface PreviewProps {
  photoLabel: string;
  videoLabel: string;
  image: string | null;
  video: string | null;
  disabled?: boolean;
  // если переданы — клик по окну открывает выбор файла с компьютера
  onPickImage?: (file?: File) => void;
  onPickVideo?: (file?: File) => void;
}

// Окно предпросмотра; при onPick — кликабельное, с скрытым input type="file"
const PreviewBox: FC<{
  label: string;
  accept: string;
  disabled?: boolean;
  onPick?: (file?: File) => void;
  children: ReactNode;
}> = ({ label, accept, disabled, onPick, children }) => {
  const content = (
    <>
      <span className="media-preview-label">{label}</span>
      {children}
      {onPick && <span className="media-preview-hint">Нажмите, чтобы выбрать файл</span>}
    </>
  );
  if (!onPick) return <div className="media-preview-box">{content}</div>;
  return (
    <label className={`media-preview-box clickable ${disabled ? "disabled" : ""}`}>
      <input
        type="file"
        accept={accept}
        hidden
        disabled={disabled}
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      {content}
    </label>
  );
};

// Предпросмотр фото и видео друг под другом (как в ЛР2)
const MediaPreview: FC<PreviewProps> = ({ photoLabel, videoLabel, image, video, disabled, onPickImage, onPickVideo }) => (
  <div className="media-preview-vertical">
    <PreviewBox label={photoLabel} accept="image/*" disabled={disabled} onPick={onPickImage}>
      <img
        src={image ?? DEFAULT_IMAGE}
        alt={photoLabel}
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
        }}
      />
    </PreviewBox>
    <PreviewBox label={videoLabel} accept="video/*" disabled={disabled} onPick={onPickVideo}>
      {video ? (
        <video key={video} src={video} autoPlay muted loop playsInline />
      ) : (
        <img src={DEFAULT_IMAGE} alt="Видео не выбрано" />
      )}
    </PreviewBox>
  </div>
);

// Добавление пигмента: шаг 1 — черновик, шаг 2 — публикация
export const AddPigmentPage: FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);
  const { draft } = useAppSelector((s) => s.pigmentDraft);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchPigmentDraft());
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return (
    <main className="add-page">
      <h1 className="section-title">Добавление пигмента</h1>
      {draft ? <PublishStep key={draft.id} draft={draft} /> : <DraftStep />}
    </main>
  );
};

// Шаг 1: название, изображение и видео -> createPigmentDraft
const DraftStep: FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.pigmentDraft);

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File>();
  const [videoFile, setVideoFile] = useState<File>();

  const imagePreview = useObjectUrl(imageFile);
  const videoPreview = useObjectUrl(videoFile);

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    // файлы с компьютера отправляются на бэкенд и загружаются в MinIO
    dispatch(createPigmentDraft({ name: name.trim(), image: imageFile, video: videoFile }));
  };

  return (
    <form className="analysis-form" onSubmit={handleNext}>
      <MediaPreview
        photoLabel={imageFile ? `Фото: ${imageFile.name}` : "Фото"}
        videoLabel={videoFile ? `Видео: ${videoFile.name}` : "Видео"}
        image={imagePreview}
        video={videoPreview}
        disabled={loading}
        onPickImage={setImageFile}
        onPickVideo={setVideoFile}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="form-group">
        <label htmlFor="name">Название образца</label>
        <input id="name" className="form-input" placeholder="Напр. Киноварь" value={name}
          onChange={(e) => setName(e.target.value)} required disabled={loading} />
      </div>

      <button type="submit" className="search-btn" disabled={loading || !name.trim()}>
        ДАЛЕЕ
      </button>
    </form>
  );
};

// Шаг 2: описание и коэффициенты R и A -> publishPigmentDraft
const PublishStep: FC<{ draft: Pigment }> = ({ draft }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.pigmentDraft);
  const [shortDescription, setShortDescription] = useState(draft.short_description ?? "");
  const [reflection, setReflection] = useState("");
  const [absorption, setAbsorption] = useState("");

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      publishPigmentDraft({
        id: draft.id,
        data: {
          short_description: shortDescription,
          reflection: parseFloat(reflection),
          absorption: parseFloat(absorption),
        },
      }),
    );
    if (publishPigmentDraft.fulfilled.match(result)) navigate(ROUTES.TILES);
  };

  return (
    <form className="analysis-form" onSubmit={handlePublish}>
      <MediaPreview
        photoLabel="Выбранное фото"
        videoLabel="Выбранное видео"
        image={mediaUrl(draft.image_url)}
        video={mediaUrl(draft.video_url)}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="form-group">
        <label>
          Образец: <b className="draft-name">{draft.name}</b>
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="short_description">Краткое описание</label>
        <textarea id="short_description" className="form-textarea" rows={4}
          placeholder="Введите экспертное описание пигмента..." value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)} required disabled={loading} />
      </div>

      <div className="form-group form-row-2">
        <div>
          <label htmlFor="reflection">Коэф. отражения (R)</label>
          <input id="reflection" type="number" min="0" max="1" step="0.01" className="form-input"
            placeholder="0.75" value={reflection} onChange={(e) => setReflection(e.target.value)}
            required disabled={loading} />
        </div>
        <div>
          <label htmlFor="absorption">Коэф. поглощения (A)</label>
          <input id="absorption" type="number" min="0" max="1" step="0.01" className="form-input"
            placeholder="0.25" value={absorption} onChange={(e) => setAbsorption(e.target.value)}
            required disabled={loading} />
        </div>
      </div>

      <button type="submit" className="search-btn" disabled={loading}>
        ОПУБЛИКОВАТЬ
      </button>
    </form>
  );
};

export default AddPigmentPage;
