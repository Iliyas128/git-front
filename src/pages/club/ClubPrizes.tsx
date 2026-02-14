import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Skeleton from '@/components/Skeleton';
import './ClubPages.css';

export default function ClubPrizes() {
  const { fetchClubPrizeClaims, confirmPrizeClaim, updateClubTime, isLoading } = useStore();
  const [prizeClaims, setPrizeClaims] = useState<any[]>([]);

  useEffect(() => {
    fetchClubPrizeClaims().then(setPrizeClaims);
  }, [fetchClubPrizeClaims]);

  const handleConfirmPrize = async (claimId: string) => {
    const success = await confirmPrizeClaim(claimId);
    if (success) {
      fetchClubPrizeClaims().then(setPrizeClaims);
    }
  };

  const handleIssuePrize = async (claimId: string) => {
    const success = await updateClubTime(claimId, 'activate');
    if (success) {
      fetchClubPrizeClaims().then(setPrizeClaims);
    }
  };

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className="club-page">
      <div className="prizes-tab">
        <h2>Призы для выдачи</h2>
        {prizeClaims.length === 0 ? (
          <div className="empty-state">
            <p>Нет призов для выдачи</p>
          </div>
        ) : (
          <div className="prizes-list">
            {prizeClaims.map((claim: any) => {
              const prize = claim.prizeId || {};
              const player = claim.userId || {};
              return (
                <div key={claim._id || claim.id} className="prize-card">
                  <div className="prize-info">
                    <h3>{prize.name || 'Неизвестный приз'}</h3>
                    <p>{prize.description || ''}</p>
                    <p className="player-info-text">Игрок: {player.phone || 'Неизвестно'}</p>
                    <span className={`prize-status status-${claim.status}`}>
                      {claim.status === 'pending' && 'Ожидает подтверждения'}
                      {claim.status === 'confirmed' && 'Подтвержден'}
                      {claim.status === 'issued' && 'Выдан'}
                    </span>
                  </div>
                  <div className="prize-actions">
                    {claim.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmPrize(claim._id || claim.id)}
                        className="confirm-button"
                      >
                        Подтвердить
                      </button>
                    )}
                    {claim.status === 'confirmed' && prize.type === 'club_time' && (
                      <button
                        onClick={() => handleIssuePrize(claim._id || claim.id)}
                        className="issue-button"
                      >
                        Активировать время
                      </button>
                    )}
                    {claim.status === 'issued' && (
                      <span className="issued-badge">Выдан</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
