import React, { useState, useEffect, useRef } from 'react';
import { Player } from '@/types';
import { X, Upload } from 'lucide-react';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (player: Omit<Player, 'id'>) => Promise<void>;
  initialData?: Player | null;
}

export default function PlayerModal({ isOpen, onClose, onSave, initialData }: PlayerModalProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [number, setNumber] = useState('');
  const [imageData, setImageData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPosition(initialData.position);
        setNumber(initialData.number.toString());
        setImageData(initialData.image_data || '');
      } else {
        setName('');
        setPosition('');
        setNumber('');
        setImageData('');
      }
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position || !number) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        name,
        position,
        number: parseInt(number, 10),
        image_data: imageData || undefined
      });
      onClose();
    } catch (error) {
      console.error('Failed to save player', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Player' : 'Add New Player'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lionel Messi"
              required
            />
          </div>

          <div className="form-group">
            <label>Position</label>
            <input 
              type="text" 
              className="form-control" 
              value={position} 
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Forward"
              required
            />
          </div>

          <div className="form-group">
            <label>Jersey Number</label>
            <input 
              type="number" 
              className="form-control" 
              value={number} 
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. 10"
              required
              min="0"
              max="99"
            />
          </div>

          <div className="form-group">
            <label>Profile Image</label>
            <input 
              type="file" 
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} /> Choose Image
            </button>
            
            {imageData && (
              <div className="image-upload-preview">
                <img src={imageData} alt="Preview" />
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
