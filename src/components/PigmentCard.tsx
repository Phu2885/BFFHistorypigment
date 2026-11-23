import type { FC } from "react";
import { Card } from "react-bootstrap";
import { DEFAULT_IMAGE, mediaUrl } from "../modules/media";
import "./PigmentCard.css";

interface Props {
  name: string;
  image_url?: string;
  reflection?: number;
  absorption?: number;
  likes?: number;
  canDelete?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export const PigmentCard: FC<Props> = ({
  name,
  image_url,
  reflection,
  absorption,
  likes = 0,
  canDelete,
  disabled,
  onClick,
  onDelete,
}) => (
  <Card className="card" onClick={onClick}>
    <div className="cardImgWrapper">
      <Card.Img
        className="card-img"
        variant="top"
        src={mediaUrl(image_url) ?? DEFAULT_IMAGE}
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
        }}
      />
    </div>
    <div className="card-content">
      <Card.Title className="card-title">{name}</Card.Title>
      <div className="card-footer">
        <span>R: {reflection ?? 0} | A: {absorption ?? 0}</span>
        <span>❤️ {likes}</span>
      </div>
      {canDelete && (
        <button
          type="button"
          className="card-delete"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          Удалить
        </button>
      )}
    </div>
  </Card>
);

export default PigmentCard;
