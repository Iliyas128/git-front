import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Skeleton from '@/components/Skeleton';
import type { Club, Player } from '@/types';
import './ClubPages.css';

export default function ClubPlayers() {
  const { currentUser, players, fetchClubPlayers, fetchClubPrizeClaims, isLoading } = useStore();
  const club = currentUser as Club | null;
  const [prizeClaims, setPrizeClaims] = useState<any[]>([]);

  useEffect(() => {
    if (club) {
      fetchClubPlayers();
      fetchClubPrizeClaims().then(setPrizeClaims);
    }
  }, [club, fetchClubPlayers, fetchClubPrizeClaims]);

  const prizeCountByUserId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const claim of prizeClaims) {
      const uid = claim.userId?._id ?? claim.userId?.id ?? claim.userId;
      if (uid) {
        const key = String(uid);
        map[key] = (map[key] ?? 0) + 1;
      }
    }
    return map;
  }, [prizeClaims]);

  if (isLoading && players.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="club-page">
      <div className="players-tab">
        <h2>Игроки Infinity</h2>
        {!club ? (
          <div className="empty-state">
            <p>Клуб не найден</p>
          </div>
        ) : players.length === 0 ? (
          <div className="empty-state">
            <p>Нет зарегистрированных игроков</p>
            <p className="hint">Игроки появятся после привязки к клубу или прокрутки рулетки</p>
          </div>
        ) : (
          <div className="players-list">
            {players.map((player: Player) => (
              <div key={player.id} className="player-card">
                <div className="player-info">
                  <h3>{player.phone ?? '—'}</h3>
                  <p>Баланс: {Number(player.balance) ?? 0} баллов</p>
                  <p>Призов: {prizeCountByUserId[String(player.id)] ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
