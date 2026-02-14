import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Skeleton from '@/components/Skeleton';
import type { Player, Prize } from '@/types';
import './SpinPage.css';

export default function SpinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clubId = searchParams.get('club');
  const { currentUser, spinRoulette, prizes, getClubByQR, error } = useStore();
  const [isScanning, setIsScanning] = useState(!clubId);
  const [scannedClubId, setScannedClubId] = useState<string | null>(clubId);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);

  useEffect(() => {
    if (clubId) {
      setScannedClubId(clubId);
      setIsScanning(false);
    }
  }, [clubId]);

  const handleQRScan = async (qrToken: string) => {
    try {
      const club = await getClubByQR(qrToken);
      if (club) {
        setScannedClubId(club.clubId);
        setIsScanning(false);
        navigate(`/spin?club=${club.clubId}`, { replace: true });
      } else {
        alert('Infinity не найден');
      }
    } catch (err) {
      alert('Ошибка сканирования QR-кода');
    }
  };

  const handleSpin = async () => {
    if (!scannedClubId || !currentUser || currentUser.role !== 'player') return;
    
    const player = currentUser as Player;
    if (player.balance < 20) {
      alert('Недостаточно баллов для прокрутки! Нужно 20 баллов.');
      return;
    }

    setIsSpinning(true);
    setResult(null);

    try {
      // Отправляем запрос на спин - рулетка будет крутиться на экране Infinity
      const prize = await spinRoulette(scannedClubId);
      setIsSpinning(false);
      
      if (prize) {
        setResult(prize);
        // Показываем результат игроку
        setTimeout(() => {
          setResult(null);
          navigate('/player');
        }, 5000);
      } else {
        alert(error || 'Ошибка прокрутки');
      }
    } catch (err) {
      setIsSpinning(false);
      alert('Ошибка при прокрутке рулетки');
    }
  };

  if (!currentUser || currentUser.role !== 'player') {
    return (
      <div className="spin-page">
        <div className="error-container">
          <h2>Доступ запрещен</h2>
          <p>Только игроки могут использовать рулетку</p>
        </div>
      </div>
    );
  }

  const player = currentUser as Player;

  return (
    <div className="spin-page">
      <div className="spin-container">
        {isScanning ? (
          <div className="qr-scanner-container">
            <h1 className="scan-title">Отсканируйте QR-код Infinity</h1>
            <p className="scan-subtitle">Наведите камеру на QR-код на мониторе Infinity</p>
            <QRScanner onScan={handleQRScan} />
          </div>
        ) : (
          <>
            <div className="spin-header">
              <h1>Рулетка призов</h1>
              <div className="balance-info">
                <span>Баланс: {player.balance} баллов</span>
                <span className="spin-cost">Стоимость: 20 баллов</span>
              </div>
            </div>

            <div className="club-info">
              <p>Infinity: {scannedClubId}</p>
              <button
                onClick={() => setIsScanning(true)}
                className="rescan-button"
              >
                Сканировать другой QR
              </button>
            </div>

            <div className="prizes-preview">
              <h2>Доступные призы</h2>
              <div className="prizes-grid-preview">
                {prizes.slice(0, 6).map((prize) => (
                  <div key={prize.id} className="prize-preview-item">
                    <div className="prize-preview-name">{prize.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="spin-info">
              <p className="spin-info-text">
                После нажатия кнопки рулетка будет крутиться на экране Infinity
              </p>
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning || player.balance < 20}
              className="spin-button"
            >
              {isSpinning ? 'Прокрутка...' : 'Запустить рулетку'}
            </button>

            {result && (
              <div className="result-modal">
                <div className="result-content">
                  <h2>Результат</h2>
                  <div className="result-prize-info">
                    <h3>{result.name}</h3>
                    {result.description && <p>{result.description}</p>}
                  </div>
                  <button onClick={() => setResult(null)} className="close-button">
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QRScanner({ onScan }: { onScan: (qrToken: string) => void }) {
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-placeholder">
        <p>📷 Камера для сканирования QR</p>
        <p className="hint">Для демо используйте ручной ввод</p>
      </div>
      <form onSubmit={handleManualSubmit} className="manual-input-form">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Введите QR токен Infinity"
          className="manual-input"
        />
        <button type="submit" className="submit-scan-button">
          Подтвердить
        </button>
      </form>
    </div>
  );
}
