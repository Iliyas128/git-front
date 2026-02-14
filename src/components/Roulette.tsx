import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import './Roulette.css';

interface RouletteProps {
  isSpinning?: boolean;
  selectedPrizeIndex?: number;
}

export default function Roulette({ isSpinning = false, selectedPrizeIndex }: RouletteProps) {
  const { prizes } = useStore();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && selectedPrizeIndex !== undefined) {
      // Вычисляем угол для выбранного приза
      const prizeAngle = (360 / prizes.length) * selectedPrizeIndex;
      // Вращаем на несколько полных оборотов + угол приза
      const finalRotation = 360 * 5 + (360 - prizeAngle);
      setRotation(finalRotation);
    } else {
      setRotation(0);
    }
  }, [isSpinning, selectedPrizeIndex, prizes.length]);

  const prizeColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#6C5CE7',
  ];

  const slots = prizes.map((prize, index) => ({
    ...prize,
    color: prizeColors[index % prizeColors.length],
    angle: (360 / prizes.length) * index,
  }));

  return (
    <div className="roulette-wrapper">
      <div
        className="roulette-wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: rotation > 0 ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
      >
        {slots.map((slot, index) => {
          const angle = (360 / slots.length) * index;
          const sliceAngle = 360 / slots.length;
          const radius = 150;
          const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
          const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

          return (
            <div
              key={slot.id}
              className="roulette-slice"
              style={{
                transform: `rotate(${angle}deg)`,
                backgroundColor: slot.color,
                clipPath: `polygon(50% 50%, ${50 + x}% ${50 + y}%, ${50 + Math.cos((angle + sliceAngle - 90) * (Math.PI / 180)) * radius}% ${50 + Math.sin((angle + sliceAngle - 90) * (Math.PI / 180)) * radius}%)`,
              }}
            >
              <div
                className="slice-text"
                style={{
                  transform: `rotate(${-angle + sliceAngle / 2}deg)`,
                }}
              >
                {slot.name}
              </div>
            </div>
          );
        })}
      </div>
      <div className="roulette-pointer" />
    </div>
  );
}
