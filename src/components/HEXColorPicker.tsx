'use client';
import { FC } from 'react';
import ColorPicker from '@/components/ui/color-picker';

interface HEXColorPickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onAdd?: (hex: string) => void;
  disabled?: boolean;
}

const HEXColorPicker: FC<HEXColorPickerProps> = ({
  id,
  value,
  onChange,
  onAdd,
  disabled = false,
}) => {
  const handleAdd = (color: string) => {
    const normalized = color.replace(/^#/, '');
    onAdd?.(normalized);
  };

  return (
    <ColorPicker
      id={id}
      value={value}
      onChange={onChange}
      handleAdd={handleAdd}
      disabled={disabled}
    />
  );
};

export default HEXColorPicker;
