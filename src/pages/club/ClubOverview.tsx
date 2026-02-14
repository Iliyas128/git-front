import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Skeleton from '@/components/Skeleton';
import './ClubPages.css';

export default function ClubOverview() {
  const { players, fetchClubData, fetchClubPlayers, fetchClubPrizeClaims, isLoading } = useStore();
  const [prizeClaims, setPrizeClaims] = useState<any[]>([]);

  useEffect(() => {
    fetchClubData();
    fetchClubPlayers();
    fetchClubPrizeClaims().then(setPrizeClaims);
  }, [fetchClubData, fetchClubPlayers, fetchClubPrizeClaims]);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className="club-page">
      <div className="overview-tab">
        <h2>Обзор</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Всего игроков</h3>
            <div className="stat-value">{players.length}</div>
          </div>
          <div className="stat-card">
            <h3>Всего призов</h3>
            <div className="stat-value">{prizeClaims.length}</div>
          </div>
          <div className="stat-card">
            <h3>Ожидают подтверждения</h3>
            <div className="stat-value">
              {prizeClaims.filter((p: any) => p.status === 'pending').length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Выдано призов</h3>
            <div className="stat-value">
              {prizeClaims.filter((p: any) => p.status === 'issued').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
