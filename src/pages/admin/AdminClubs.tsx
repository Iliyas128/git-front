import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import ClubModal from '@/components/ClubModal';
import Skeleton from '@/components/Skeleton';
import type { Club } from '@/types';
import './AdminPages.css';

export default function AdminClubs() {
  const {
    clubs,
    fetchClubs,
    createClub,
    updateClub,
    deleteClub,
    isLoading,
  } = useStore();
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  if (isLoading && clubs.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="admin-page">
      <div className="tab-header">
        <h2>Управление клубами</h2>
        <button className="add-button" onClick={() => {
          setSelectedClub(null);
          setClubModalOpen(true);
        }}>+ Добавить клуб</button>
      </div>
      {clubs.length === 0 ? (
        <div className="empty-state">
          <p>Нет зарегистрированных клубов</p>
        </div>
      ) : (
        <div className="clubs-list">
          {clubs.map((club: Club) => (
            <Link key={club.id} to={`/admin/clubs/${club.id}`} className="club-card-link">
              <div className="club-card">
                <div className="club-info">
                  <h3>{club.clubName}</h3>
                  <p><strong>ID:</strong> {club.clubId}</p>
                  <p><strong>Телефон:</strong> {club.phone}</p>
                  <p><strong>Игроков:</strong> {club.playerCount ?? club.players?.length ?? 0}</p>
                </div>
                <div className="club-actions">
                  <button 
                    className="edit-button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedClub(club);
                      setClubModalOpen(true);
                    }}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm('Удалить клуб?')) {
                        await deleteClub(club.id);
                        await fetchClubs();
                      }
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ClubModal
        isOpen={clubModalOpen}
        onClose={() => {
          setClubModalOpen(false);
          setSelectedClub(null);
        }}
        onSave={async (data) => {
          if (selectedClub) {
            await updateClub(selectedClub.id, { name: data.name });
          } else {
            await createClub(data);
          }
          await fetchClubs();
        }}
        club={selectedClub}
      />
    </div>
  );
}
