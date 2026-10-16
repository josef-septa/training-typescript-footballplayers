import { Player } from '@/types';
import { Edit2, Trash2, User } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (id: number) => void;
}

export default function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  return (
    <div className="player-card">
      <div className="player-image-container">
        {player.image_data ? (
          <img src={player.image_data} alt={player.name} className="player-image" />
        ) : (
          <User size={64} className="player-image" style={{ color: 'var(--text-secondary)' }} />
        )}
      </div>
      
      <div className="player-info">
        <h3 className="player-name">{player.name}</h3>
        <p className="player-position">{player.position}</p>
        <span className="player-number">#{player.number}</span>
      </div>

      <div className="card-actions">
        <button className="btn btn-secondary" onClick={() => onEdit(player)}>
          <Edit2 size={16} /> Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(player.id)}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
