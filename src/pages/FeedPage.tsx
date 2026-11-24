import "./FeedPage.css";
import { useEffect, useState, type FC } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../Routes";
import { DEFAULT_IMAGE, mediaUrl } from "../modules/media";
import { IS_PAGES } from "../modules/env";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchPigmentsFeed, togglePigmentLike } from "../slices/pigmentsSlice";

// React не выставляет HTML-атрибут muted, а без него Safari (iPhone) и Chrome
// не запускают видео автоматически — ставим атрибут сами и запускаем воспроизведение.
const startVideo = (el: HTMLVideoElement | null) => {
  if (!el) return;
  el.muted = true;
  el.setAttribute("muted", "");
  el.play().catch(() => {
    // браузер может запретить автозапуск — тогда остаётся обложка (poster)
  });
};

export const FeedPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { feedItem, loading, error, isMock } = useAppSelector((s) => s.pigments);
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const numericId = id ? Number(id) : undefined;
    if (numericId && feedItem?.id === numericId) return; // уже загружен кнопкой «Вперёд»
    dispatch(fetchPigmentsFeed({ id: numericId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, isAuthenticated]);

  const handleNext = async () => {
    if (!feedItem) return;
    const result = await dispatch(fetchPigmentsFeed({ id: feedItem.id, next: true }));
    if (fetchPigmentsFeed.fulfilled.match(result)) {
      setShowMore(false);
      navigate(`${ROUTES.FEED}/${result.payload.data.id}`);
    }
  };

  const handleLike = () => {
    if (!feedItem || !isAuthenticated) return;
    dispatch(togglePigmentLike({ id: feedItem.id, value: feedItem.is_like ? 0 : 1 }));
  };

  if (!feedItem) {
    return (
      <div className="detailLoader">
        {error && <Alert variant="danger">{error}</Alert>}
      </div>
    );
  }

  const video = mediaUrl(feedItem.video_url);
  const image = mediaUrl(feedItem.image_url) ?? DEFAULT_IMAGE;

  return (
    <div className="feed-page">
      {video ? (
        <video key={video} ref={startVideo} className="video-bg" src={video} poster={image}
          autoPlay loop muted playsInline preload="auto" />
      ) : (
        <img
          className="video-bg"
          src={image}
          alt={feedItem.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />
      )}

      {isMock && !IS_PAGES && <div className="feed-mock-badge">mock-данные</div>}

      <div className="feed-layout">
        <div className="feed-description-side">
          <h1 className="pigment-title">{feedItem.name}</h1>
          <div className="description-container">
            <p
              className="pigment-desc"
              style={{
                display: showMore ? "block" : "-webkit-box",
                WebkitLineClamp: showMore ? "unset" : 2,
                WebkitBoxOrient: "vertical",
                overflow: showMore ? "visible" : "hidden",
              }}
            >
              {feedItem.short_description || "Исторический пигмент искусства"}
            </p>
            <span className="desc-label" onClick={() => setShowMore(!showMore)}>
              {showMore ? "МЕНЬШЕ ▲" : "ЕЩЁ ▼"}
            </span>
          </div>
        </div>

        <div className="feed-params-side">
          <div className="param-group">
            <span className="param-label">ОТРАЖЕНИЕ (R)</span>
            <span className="param-value">{feedItem.reflection ?? 0}</span>
          </div>

          <div className="param-group">
            <span className="param-label">ПОГЛОЩЕНИЕ (A)</span>
            <span className="param-value">{feedItem.absorption ?? 0}</span>
          </div>

          <button
            type="button"
            className={`action-icon like-btn ${feedItem.is_like ? "liked" : ""}`}
            onClick={handleLike}
            disabled={!isAuthenticated || loading}
            title={isAuthenticated ? "Лайк" : "Лайк доступен после входа"}
          >
            {feedItem.is_like ? "❤️" : "🤍"}
            <div style={{ fontSize: "12px", fontWeight: 700 }}>{feedItem.likes ?? 0}</div>
          </button>

          <button className="next-btn-vertical" onClick={handleNext} disabled={loading}>
            <span className="next-icon">▶</span>
            <span className="next-text">ВПЕРЁД</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
