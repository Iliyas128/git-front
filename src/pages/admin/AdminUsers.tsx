import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import UserModal from '@/components/UserModal';
import Skeleton from '@/components/Skeleton';
import type { Player } from '@/types';
import './AdminPages.css';

export default function AdminUsers() {
  const {
    players,
    fetchUsers,
    updateUser,
    deleteUser,
    isLoading,
  } = useStore();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Player | null>(null);

  useEffect(() => {
    fetchUsers('player');
  }, [fetchUsers]);

  if (isLoading && players.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="admin-page">
      <div className="tab-header">
        <h2>Управление пользователями</h2>
      </div>
      {players.length === 0 ? (
        <div className="empty-state">
          <p>Нет зарегистрированных пользователей</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Телефон</th>
                <th>Баланс</th>
                <th>Призов</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player: Player) => (
                <tr key={player.id}>
                  <td>{player.phone}</td>
                  <td>{player.balance} баллов</td>
                  <td>{player.prizes.length}</td>
                  <td>{new Date(player.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <div className="club-actions">
                      <button className="edit-button" onClick={() => {
                        setSelectedUser(player);
                        setUserModalOpen(true);
                      }}>Редактировать</button>
                      <button className="delete-button" onClick={async () => {
                        if (window.confirm('Удалить пользователя?')) {
                          await deleteUser(player.id);
                          await fetchUsers('player');
                        }
                      }}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={async (data) => {
          if (selectedUser) {
            await updateUser(selectedUser.id, data);
            await fetchUsers('player');
          }
        }}
        user={selectedUser}
      />
    </div>
  );
}
