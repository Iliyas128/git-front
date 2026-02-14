import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Skeleton from '@/components/Skeleton';
import './AdminPages.css';

export default function AdminAnalytics() {
  const { fetchAnalytics, clubs } = useStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      const data = await fetchAnalytics();
      setAnalytics(data);
      setIsLoading(false);
    };
    loadAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className="admin-page">
      <div className="tab-header">
        <h2>Аналитика</h2>
      </div>
      {analytics ? (
        <div className="analytics-grid">
          <div className="stat-card">
            <h3>Всего игроков</h3>
            <div className="stat-value">{analytics.totalPlayers || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Всего прокруток</h3>
            <div className="stat-value">{analytics.totalSpins || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Всего призов</h3>
            <div className="stat-value">{analytics.totalPrizes || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Всего клубов</h3>
            <div className="stat-value">{analytics.totalClubs || clubs.length}</div>
          </div>
          {analytics.clubStats && analytics.clubStats.length > 0 && (
            <div className="analytics-section">
              <h3>Статистика клубов</h3>
              <div className="club-stats-list">
                {analytics.clubStats.map((stat: any, index: number) => (
                  <p key={index}>{stat.clubName}: {stat.count}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>Загрузка аналитики...</p>
        </div>
      )}
    </div>
  );
}
