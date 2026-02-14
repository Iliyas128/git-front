import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import type { Prize } from '@/types';
import './ClubRoulettePage.css';

export default function ClubRoulettePage() {
  const { prizes, rouletteConfig } = useStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [spinningIndex, setSpinningIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Симуляция получения спина от игрока
  useEffect(() => {
    // Здесь будет WebSocket или polling для получения спина от игрока
    // Пока что симуляция
  }, []);

  const startSpin = (prize: Prize) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedPrize(null);
    
    // Анимация прокрутки по сетке
    let currentIndex = 0;
    const totalItems = prizes.length;
    const spinDuration = 4000;
    const interval = 30;
    const steps = spinDuration / interval;
    let step = 0;

    // Находим индекс приза
    const targetIndex = prizes.findIndex(p => p.id === prize.id);
    const finalIndex = targetIndex >= 0 ? targetIndex : 0;

    intervalRef.current = setInterval(() => {
      step++;
      currentIndex = (currentIndex + 1) % totalItems;
      setSpinningIndex(currentIndex);

      if (step >= steps) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Останавливаемся на выбранном призе
        setSpinningIndex(finalIndex);
        setSelectedPrize(prize);
        setIsSpinning(false);
        
        // Автоматически скрываем результат через 5 секунд
        setTimeout(() => {
          setSelectedPrize(null);
        }, 5000);
      }
    }, interval);
  };

  // Функция для получения спина (будет вызываться через API или WebSocket)
  const receiveSpin = (prizeData: any) => {
    const prize = prizes.find(p => p.id === prizeData.prizeId) || prizes[0];
    if (prize) {
      startSpin(prize);
    }
  };

  // Симуляция получения спина (для тестирования)
  const handleTestSpin = () => {
    if (prizes.length > 0 && !isSpinning) {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      startSpin(randomPrize);
    }
  };

  // Экспортируем функцию для внешнего вызова (через window для тестирования)
  useEffect(() => {
    (window as any).receiveSpin = receiveSpin;
    return () => {
      delete (window as any).receiveSpin;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [prizes]);

  return (
    <div className="club-roulette-page">
      <div className="roulette-header">
        <h1 className="roulette-title">Рулетка призов</h1>
        <div className="roulette-subtitle">Ожидание игрока...</div>
      </div>

      <div className="prizes-grid-container">
        <div className="prizes-grid">
          {prizes.map((prize, index) => {
            const isHighlighted = isSpinning && spinningIndex === index;
            const isSelected = !isSpinning && selectedPrize?.id === prize.id;
            
            return (
              <div
                key={prize.id}
                className={`prize-item ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="prize-item-inner">
                  <div className="prize-image-placeholder">
                    {prize.name.charAt(0)}
                  </div>
                  <div className="prize-name">{prize.name}</div>
                  {prize.value && (
                    <div className="prize-value">{prize.value}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPrize && !isSpinning && (
        <div className="result-overlay">
          <div className="result-content">
            <h2 className="result-title">Выигрыш!</h2>
            <div className="result-prize">
              <div className="result-prize-name">{selectedPrize.name}</div>
              {selectedPrize.description && (
                <div className="result-prize-desc">{selectedPrize.description}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Кнопка для тестирования (убрать в продакшене) */}
      {process.env.NODE_ENV === 'development' && (
        <button onClick={handleTestSpin} className="test-spin-button">
          Тест спин
        </button>
      )}
    </div>
  );
}
