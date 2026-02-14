import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { QRCodeSVG } from 'qrcode.react';
import { apiService } from '@/services/api';
import { transformPrize } from '@/utils/transformers';
import type { Club, Prize } from '@/types';
import './ClubPages.css';
import '../ClubRoulettePage.css';

export default function ClubQR() {
  const { currentUser } = useStore();
  const club = currentUser as Club | null;
  const [roulettePrizes, setRoulettePrizes] = useState<Prize[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [lastSpinId, setLastSpinId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Загружаем призы рулетки
  useEffect(() => {
    const loadPrizes = async () => {
      try {
        const prizes = await apiService.getRoulettePrizes();
        const transformedPrizes = prizes.map(transformPrize);
        setRoulettePrizes(transformedPrizes);
      } catch (error) {
        console.error('Ошибка загрузки призов рулетки:', error);
      }
    };
    loadPrizes();
  }, []);

  // Polling для проверки новых спинов
  useEffect(() => {
    if (!club) return;

    const checkForNewSpin = async () => {
      try {
        const latestSpin = await apiService.getClubLatestSpin();
        if (latestSpin && latestSpin._id !== lastSpinId) {
          setLastSpinId(latestSpin._id);
          // Запускаем рулетку с выигранным призом
          if (latestSpin.prize) {
            const prize = roulettePrizes.find(
              p => p.id === latestSpin.prize._id || 
              (latestSpin.prize.slotIndex !== undefined && p.slotIndex === latestSpin.prize.slotIndex)
            );
            if (prize) {
              startSpin(prize);
            } else {
              // Если приз не найден в списке, создаем временный объект
              const tempPrize: Prize = {
                id: latestSpin.prize._id || '',
                name: latestSpin.prize.name || 'Приз',
                type: latestSpin.prize.type || 'points',
                value: latestSpin.prize.value,
                image: latestSpin.prize.image,
                probability: 0,
                slotIndex: latestSpin.prize.slotIndex || 0,
                createdAt: new Date().toISOString(),
              };
              startSpin(tempPrize);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка проверки спинов:', error);
      }
    };

    // Проверяем каждые 2 секунды
    pollingRef.current = setInterval(checkForNewSpin, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [club, lastSpinId, roulettePrizes]);

  const [scrollPosition, setScrollPosition] = useState(0);
  const rouletteRef = useRef<HTMLDivElement>(null);

  const startSpin = (prize: Prize) => {
    if (isSpinning || !rouletteRef.current) return;
    
    setIsSpinning(true);
    setSelectedPrize(null);
    
    // Находим индекс приза
    const targetIndex = roulettePrizes.findIndex(p => 
      p.id === prize.id || 
      (prize.slotIndex !== undefined && p.slotIndex === prize.slotIndex)
    );
    const finalIndex = targetIndex >= 0 ? targetIndex : 0;

    // Размер одного элемента приза
    const prizeWidth = 284; // ширина карточки приза (260px) + gap (24px)
    const containerWidth = rouletteRef.current.offsetWidth;
    const centerOffset = containerWidth / 2 - prizeWidth / 2;

    // Начальная позиция (далеко слева для эффекта прокрутки)
    const startPosition = -prizeWidth * 10; // начинаем с 10 призов слева
    setScrollPosition(startPosition);

    // Целевая позиция (центрируем выигранный приз)
    // Учитываем, что призы дублируются, поэтому используем индекс из первого набора
    const targetPosition = -finalIndex * prizeWidth + centerOffset;

    // Анимация с замедлением (ease-out)
    const duration = 4000; // 4 секунды
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing функция для плавного замедления
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = startPosition + (targetPosition - startPosition) * easeOut;
      setScrollPosition(currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Анимация завершена
        setScrollPosition(targetPosition);
        setSelectedPrize(prize);
        setIsSpinning(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Очистка интервалов при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  if (!club) {
    return null;
  }

  const handleTestSpin = () => {
    if (roulettePrizes.length > 0 && !isSpinning) {
      const randomPrize = roulettePrizes[Math.floor(Math.random() * roulettePrizes.length)];
      startSpin(randomPrize);
    }
  };

  return (
    <div className="club-page qr-roulette-page-fullscreen">
      {/* Рулетка на весь экран */}
      {roulettePrizes.length > 0 && (
        <div className="roulette-section-fullscreen">
          <div className="roulette-header-fullscreen">
            <h1>Рулетка призов</h1>
            <div className="roulette-status">
              {isSpinning ? (
                <span className="status-spinning">Крутится...</span>
              ) : selectedPrize ? (
                <span className="status-winner">Выигрыш!</span>
              ) : (
                <span className="status-waiting">Ожидание игрока...</span>
              )}
            </div>
          </div>

            <div className="cs-roulette-container">
              <div className="cs-roulette-pointer"></div>
              <div 
                ref={rouletteRef}
                className="cs-roulette-track"
              >
                <div 
                  className="cs-roulette-items"
                  style={{
                    transform: `translateX(${scrollPosition}px)`,
                    transition: isSpinning ? 'none' : 'transform 0.3s ease-out',
                  }}
                >
                  {/* Дублируем призы для бесшовной прокрутки */}
                  {[...roulettePrizes, ...roulettePrizes, ...roulettePrizes].map((prize, index) => {
                    const isSelected = !isSpinning && selectedPrize?.id === prize.id;
                    const originalIndex = index % roulettePrizes.length;
                    
                    return (
                      <div
                        key={`${prize.id}-${index}`}
                        className={`cs-prize-item ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="cs-prize-inner">
                          {prize.image ? (
                            <img 
                              src={prize.image} 
                              alt={prize.name}
                              className="cs-prize-image"
                            />
                          ) : (
                            <div className="cs-prize-placeholder">
                              {prize.name.charAt(0)}
                            </div>
                          )}
                          <div className="cs-prize-name">{prize.name}</div>
                          {prize.value && (
                            <div className="cs-prize-value">{prize.value}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          {selectedPrize && !isSpinning && (
            <div className="result-overlay">
              <div className="result-content">
                <button
                  onClick={() => setSelectedPrize(null)}
                  className="result-close-button"
                  aria-label="Закрыть"
                >
                  ×
                </button>
                <h2 className="result-title">Выигрыш!</h2>
                <div className="result-prize">
                  {selectedPrize.image && (
                    <img 
                      src={selectedPrize.image} 
                      alt={selectedPrize.name}
                      className="result-prize-image"
                    />
                  )}
                  <div className="result-prize-name">{selectedPrize.name}</div>
                  {selectedPrize.description && (
                    <div className="result-prize-desc">{selectedPrize.description}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR код в правом нижнем углу */}
      <div className="qr-corner">
        <div className="qr-corner-container">
          {club.qrCode && club.qrCode.startsWith('data:image') ? (
            <img src={club.qrCode} alt="QR Code" className="qr-corner-image" />
          ) : (
            <QRCodeSVG
              value={club.token || club.qrCode || `${window.location.origin}/spin?club=${club.clubId}`}
              size={120}
              level="H"
            />
          )}
        </div>
      </div>

      {/* Кнопка тестового спина */}
      <button
        onClick={handleTestSpin}
        className="test-spin-button"
        disabled={isSpinning || roulettePrizes.length === 0}
      >
        Тест спин
      </button>
    </div>
  );
}
