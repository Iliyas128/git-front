import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import ClubModal from '@/components/ClubModal';
import Skeleton from '@/components/Skeleton';
import type { Club, Player, User } from '@/types';
import './AdminPages.css';

export default function AdminClubDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchClubs,
    updateClub,
    deleteClub,
    fetchUsers,
    isLoading,
  } = useStore();
  const [club, setClub] = useState<Club | null>(null);
  const [clubPlayers, setClubPlayers] = useState<Player[]>([]);
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClub = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const clubs = await fetchClubs();
        const foundClub = clubs.find((c: Club) => c.id === id);
        if (foundClub) {
          setClub(foundClub);
          // Загружаем игроков клуба
          const allUsers = await fetchUsers('player');
          const clubPlayersList = allUsers
            .filter((u: User) => {
              const user = u as Player;
              const userClubId = typeof user.clubId === 'string' ? user.clubId : (user as any).clubId?._id ?? (user as any).clubId;
              return userClubId && String(userClubId) === String(foundClub.id);
            })
            .map((u: User) => u as Player);
          setClubPlayers(clubPlayersList);
        } else {
          navigate('/admin/clubs');
        }
      } catch (error) {
        console.error('Ошибка загрузки клуба:', error);
        navigate('/admin/clubs');
      } finally {
        setLoading(false);
      }
    };
    loadClub();
  }, [id, fetchClubs, fetchUsers, navigate]);

  if (loading || isLoading) {
    return <Skeleton />;
  }

  if (!club) {
    return (
      <div className="admin-page">
        <div className="empty-state">
          <p>Клуб не найден</p>
          <Link to="/admin/clubs" className="back-button">← Вернуться к списку</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="club-detail-header">
        <Link to="/admin/clubs" className="back-button">← Вернуться к списку</Link>
        <div className="header-actions">
          <button className="edit-button" onClick={() => setClubModalOpen(true)}>
            Редактировать
          </button>
          <button className="delete-button" onClick={async () => {
            if (window.confirm('Удалить клуб?')) {
              await deleteClub(club.id);
              navigate('/admin/clubs');
            }
          }}>
            Удалить
          </button>
        </div>
      </div>

      <div className="club-detail-content">
        <div className="club-detail-info">
          <h2>{club.clubName}</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>ID клуба:</strong>
              <span>{club.clubId}</span>
            </div>
            <div className="info-item">
              <strong>Телефон:</strong>
              <span>{club.phone}</span>
            </div>
            <div className="info-item">
              <strong>QR токен:</strong>
              <span>{club.token || club.qrCode || 'Не настроен'}</span>
            </div>
            <div className="info-item">
              <strong>Дата создания:</strong>
              <span>{new Date(club.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>

        <div className="club-detail-stats">
          <h3>Статистика</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Всего игроков</h4>
              <div className="stat-value">{clubPlayers.length}</div>
            </div>
            <div className="stat-card">
              <h4>Активных игроков</h4>
              <div className="stat-value">{club.statistics?.activePlayers || 0}</div>
            </div>
            <div className="stat-card">
              <h4>Всего прокруток</h4>
              <div className="stat-value">{club.statistics?.totalSpins || 0}</div>
            </div>
            <div className="stat-card">
              <h4>Выданных призов</h4>
              <div className="stat-value">{club.statistics?.totalPrizes || 0}</div>
            </div>
          </div>
        </div>

        <div className="club-detail-players">
          <h3>Игроки клуба</h3>
          {clubPlayers.length === 0 ? (
            <div className="empty-state">
              <p>Нет игроков в этом клубе</p>
            </div>
          ) : (
            <div className="players-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Телефон</th>
                    <th>Баланс</th>
                    <th>Призов</th>
                    <th>Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {clubPlayers.map((player: Player) => (
                    <tr key={player.id}>
                      <td>{player.phone}</td>
                      <td>{player.balance} баллов</td>
                      <td>{player.prizeCount ?? player.prizes?.length ?? 0}</td>
                      <td>{new Date(player.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ClubModal
        isOpen={clubModalOpen}
        onClose={() => setClubModalOpen(false)}
        onSave={async (data) => {
          await updateClub(club.id, { name: data.name });
          await fetchClubs();
          setClubModalOpen(false);
          // Обновляем данные клуба
          const clubs = await fetchClubs();
          const updatedClub = clubs.find((c: Club) => c.id === club.id);
          if (updatedClub) {
            setClub(updatedClub);
          }
        }}
        club={club}
      />
    </div>
  );
}
