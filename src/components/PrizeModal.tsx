import { useState, useEffect } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import type { Prize } from '@/types';
import './PrizeModal.css';

interface PrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    type: string;
    value?: number;
    dropChance: number;
    slotIndex: number;
    totalQuantity: number;
    image?: File | null;
  }) => Promise<void>;
  prize?: Prize | null;
}

export default function PrizeModal({ isOpen, onClose, onSave, prize }: PrizeModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('points');
  const [value, setValue] = useState<number>(0);
  const [dropChance, setDropChance] = useState<number>(0);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(100);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (prize) {
      setName(prize.name || '');
      setType(prize.type || 'points');
      setValue(prize.value || 0);
      setDropChance((prize.probability || 0) * 100);
      setSlotIndex(0);
      setTotalQuantity(100);
      setImage(null);
      setImagePreview(prize.image || null);
    } else {
      setName('');
      setType('points');
      setValue(0);
      setDropChance(0);
      setSlotIndex(0);
      setTotalQuantity(100);
      setImage(null);
      setImagePreview(null);
    }
  }, [prize, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || dropChance <= 0) return;
    if (!prize && !image) {
      alert('Пожалуйста, выберите изображение для приза');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name,
        type,
        value: type === 'points' || type === 'club_time' ? value : undefined,
        dropChance,
        slotIndex,
        totalQuantity,
        image,
      });
      onClose();
    } catch (error) {
      console.error('Error saving prize:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={prize ? 'Редактировать приз' : 'Создать приз'}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Название приза"
          name="name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Введите название приза"
          required
        />
        <FormField
          label="Тип приза"
          name="type"
          type="select"
          value={type}
          onChange={setType}
          required
          options={[
            { value: 'points', label: 'Баллы' },
            { value: 'physical', label: 'Физический приз' },
            { value: 'club_time', label: 'Время в Infinity' },
            { value: 'other', label: 'Другое' },
          ]}
        />
        {(type === 'points' || type === 'club_time') && (
          <FormField
            label={type === 'points' ? 'Количество баллов' : 'Минуты'}
            name="value"
            type="number"
            value={value}
            onChange={setValue}
            placeholder="0"
            min={0}
            required
          />
        )}
        <FormField
          label="Вероятность выпадения (%)"
          name="dropChance"
          type="number"
          value={dropChance}
          onChange={setDropChance}
          placeholder="0-100"
          min={0}
          max={100}
          step={0.1}
          required
        />
        {!prize && (
          <>
            <FormField
              label="Индекс слота"
              name="slotIndex"
              type="number"
              value={slotIndex}
              onChange={setSlotIndex}
              placeholder="0-24"
              min={0}
              max={24}
              required
            />
            <FormField
              label="Общее количество"
              name="totalQuantity"
              type="number"
              value={totalQuantity}
              onChange={setTotalQuantity}
              placeholder="100"
              min={1}
              required
            />
          </>
        )}
        <div className="form-field">
          <label htmlFor="prize-image" className="form-label">
            Изображение приза
            {!prize && <span className="required">*</span>}
          </label>
          <div className="image-upload-container">
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="remove-image-button"
                >
                  ×
                </button>
              </div>
            )}
            <label htmlFor="prize-image" className="image-upload-button">
              {imagePreview ? 'Изменить изображение' : 'Выбрать изображение'}
              <input
                id="prize-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Отмена
          </button>
          <button type="submit" className="save-button" disabled={isLoading}>
            {isLoading ? 'Сохранение...' : prize ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
