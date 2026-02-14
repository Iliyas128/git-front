import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import PrizeModal from '@/components/PrizeModal';
import Skeleton from '@/components/Skeleton';
import type { Prize, RouletteSlot } from '@/types';
import './AdminPages.css';

export default function AdminRoulette() {
  const {
    prizes,
    rouletteConfig,
    fetchPrizes,
    createPrize,
    updatePrize,
    isLoading,
  } = useStore();
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  useEffect(() => {
    fetchPrizes();
  }, [fetchPrizes]);

  if (isLoading && rouletteConfig.slots.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="admin-page">
      <div className="tab-header">
        <h2>Настройка рулетки</h2>
        <div className="roulette-info">
          <p className="info-text">
            Слоты рулетки - это позиции, на которые назначаются призы. 
            Каждый слот имеет приз и вероятность выпадения. Максимум 25 слотов.
          </p>
          <p className="info-text">
            <strong>Как это работает:</strong> Создайте приз в разделе "Призы", 
            указав индекс слота (0-24). Приз автоматически появится в рулетке.
          </p>
        </div>
      </div>
      <div className="roulette-config">
        {rouletteConfig.slots.length === 0 ? (
          <div className="empty-state">
            <p>Нет слотов в рулетке</p>
            <p className="hint">Создайте призы в разделе "Призы", чтобы они появились здесь</p>
          </div>
        ) : (
          <>
            <div className="slots-list">
              {rouletteConfig.slots.map((slot: RouletteSlot, index: number) => {
                const prize = prizes.find((p: Prize) => p.id === slot.prizeId);
                return (
                  <div key={slot.id} className="slot-card">
                    <div className="slot-info">
                      <h4>Слот {index + 1}</h4>
                      <p><strong>Приз:</strong> {prize?.name || 'Неизвестно'}</p>
                      {prize?.image && (
                        <div className="slot-prize-image">
                          <img src={prize.image} alt={prize.name} />
                        </div>
                      )}
                      <p><strong>Вероятность:</strong> {(slot.probability * 100).toFixed(1)}%</p>
                      {prize?.type && <p><strong>Тип:</strong> {prize.type}</p>}
                    </div>
                    <div className="slot-actions">
                      <button 
                        className="edit-button" 
                        onClick={() => {
                          setSelectedPrize(prize || null);
                          setPrizeModalOpen(true);
                        }}
                      >
                        Редактировать приз
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="total-probability">
              <p><strong>Общая вероятность:</strong> {(rouletteConfig.totalProbability * 100).toFixed(1)}%</p>
              {rouletteConfig.totalProbability !== 1 && (
                <p className="warning">⚠️ Внимание: сумма вероятностей должна быть равна 100%</p>
              )}
            </div>
          </>
        )}
        <div className="roulette-actions">
          <button 
            className="add-button" 
            onClick={() => {
              setSelectedPrize(null);
              setPrizeModalOpen(true);
            }}
          >
            + Создать приз для рулетки
          </button>
          <p className="hint-text">
            При создании приза укажите индекс слота (0-24), и он появится в рулетке
          </p>
        </div>
      </div>

      <PrizeModal
        isOpen={prizeModalOpen}
        onClose={() => {
          setPrizeModalOpen(false);
          setSelectedPrize(null);
        }}
        onSave={async (data) => {
          if (selectedPrize) {
            await updatePrize(selectedPrize.id, { 
              dropChance: data.dropChance,
              image: data.image || undefined
            });
          } else {
            await createPrize(data);
          }
          await fetchPrizes();
        }}
        prize={selectedPrize}
      />
    </div>
  );
}
