import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Skeleton from '@/components/Skeleton';
import type { Club, Player } from '@/types';
import './ClubPages.css';

export default function ClubPlayers() {
  const { currentUser, players, fetchClubPlayers, isLoading } = useStore();
  const club = currentUser as Club | null;

  useEffect(() => {
    if (club) {
      fetchClubPlayers();
    }
  }, [club, fetchClubPlayers]);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className="club-page">
      <div className="players-tab">
        <h2>Игроки Infinity</h2>
        {players.length === 0 ? (
          <div className="empty-state">
            <p>Нет зарегистрированных игроков</p>
          </div>
        ) : (
          <div className="players-list">
            {players.map((player: Player) => (
              <div key={player.id} className="player-card">
                <div className="player-info">
                  <h3>{player.phone}</h3>
                  <p>Баланс: {player.balance} баллов</p>
                  <p>Призов: {player.prizes?.filter((p: any) => 
                    p.clubId === club?.clubId || 
                    (p as any).clubId?.clubId === club?.clubId
                  ).length || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
