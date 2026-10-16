'use client';

import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { Player } from '@/types';
import PlayerCard from '@/components/PlayerCard';
import PlayerModal from '@/components/PlayerModal';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to fetch players', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlayer = async (playerData: Omit<Player, 'id'>) => {
    try {
      if (editingPlayer) {
        const response = await fetch(`/api/players/${editingPlayer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerData),
        });
        const updated = await response.json();
        setPlayers(players.map(p => p.id === updated.id ? updated : p));
      } else {
        const response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerData),
        });
        const created = await response.json();
        setPlayers([created, ...players]);
      }
    } catch (error) {
      console.error('Failed to save player', error);
      throw error;
    }
  };

  const handleDeletePlayer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
      await fetch(`/api/players/${id}`, { method: 'DELETE' });
      setPlayers(players.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete player', error);
    }
  };

  const openNewPlayerModal = () => {
    setEditingPlayer(null);
    setIsModalOpen(true);
  };

  const openEditPlayerModal = (player: Player) => {
    setEditingPlayer(player);
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Football Roster</h1>
        <button className="btn btn-primary" onClick={openNewPlayerModal}>
          <Plus size={20} /> Add Player
        </button>
      </header>

      <main>
        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
            Loading players...
          </div>
        ) : players.length > 0 ? (
          <div className="players-grid">
            {players.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                onEdit={openEditPlayerModal}
                onDelete={handleDeletePlayer}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Users size={48} />
            <h2>No players found</h2>
            <p style={{ marginTop: '0.5rem' }}>Add your first player to get started.</p>
          </div>
        )}
      </main>

      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlayer}
        initialData={editingPlayer}
      />
    </div>
  );
}
