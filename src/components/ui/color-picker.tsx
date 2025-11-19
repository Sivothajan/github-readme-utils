import { useCallback, useMemo, FC, ReactNode, ChangeEvent } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Pipette } from 'lucide-react';
import { RgbaColor, RgbaColorPicker } from 'react-colorful';
import { debounce } from 'lodash';
import { Input } from '@/components/ui/input';

const DEFAULT_CHILDREN = (
  <div className="bg-linear-to-br from-pink-300/20 via-violet-300/20 to-indigo-300/20 flex items-center justify-center rounded-full h-fit w-fit aspect-square p-[0.2rem] md:p-[0.2vw]">
    <div className="bg-linear-to-br from-pink-300 via-violet-300 to-indigo-300 h-8 md:h-[2vw] aspect-square rounded-full flex items-center justify-center">
      <Pipette className="text-white w-4 md:w-[1vw] aspect-square" />
    </div>
  </div>
);

type TColorPicker = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  handleAdd?: (value: string) => void;
  children?: ReactNode;
  disabled?: boolean;
};

const ColorPicker: FC<TColorPicker> = ({
  id,
  value,
  onChange,
  children = DEFAULT_CHILDREN,
  disabled = false,
}) => {
  const color = useMemo(() => {
    const rgba = hexToRgba(value);
    return { hex: value, alpha: rgba ? rgba.a : 1 };
  }, [value]);

  const debouncedOnChange = useMemo(
    () => debounce((newValue: string) => onChange(newValue), 50),
    [onChange]
  );

  const handleChangeAlpha = (e: ChangeEvent<HTMLInputElement>) => {
    const newAlpha = parseFloat(e.target.value);
    const rgba = hexToRgba(color.hex);
    if (rgba) {
      const newHex = rgbaToHex(rgba.r, rgba.g, rgba.b, newAlpha);
      onChange(newHex);
    }
  };

  const handleChangeColor = (e: ChangeEvent<HTMLInputElement>) => {
    const newColor: string = e.target.value;
    onChange(newColor);
  };

  function rgbaToHex(r: number, g: number, b: number, a: number = 1) {
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const alpha = isNaN(a) ? 255 : Math.round(a * 255);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}${
      alpha === 255 ? '' : toHex(alpha)
    }`;
  }

  function hexToRgba(hex: string) {
    if (!hex) return null;
    hex = hex.replace(/^#/, '');

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    if (hex.length !== 6 && hex.length !== 8) return null;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

    return { r, g, b, a };
  }

  const handleColorChange = useCallback(
    (newColor: { r: number; g: number; b: number; a: number }) => {
      const { r, g, b, a } = newColor;
      const newHex = rgbaToHex(r, g, b, a);
      debouncedOnChange(newHex);
    },
    [debouncedOnChange]
  );

  return (
    <Popover>
      <PopoverTrigger disabled={disabled}>{children}</PopoverTrigger>
      <PopoverContent align="center" side="top" className="w-[18rem] h-75">
        <div className="size-full flex flex-col items-center justify-between">
          <h1 className="font-medium text-xl">Colour Picker</h1>
          <RgbaColorPicker
            id={id}
            color={hexToRgba(color.hex) as RgbaColor}
            onChange={handleColorChange}
            className="w-full! aspect-square"
          />
          <div className="w-full flex flex-col items-center gap-6 md:gap-[3vw] mt-2 md:mt-[0.5vw]">
            <div className="w-full h-10 md:h-[2.5vw] flex items-center justify-center">
              <label className="mr-2 md:mr-[0.5vw]">HEX</label>
              <Input
                id={id}
                className="w-full rounded-r-none! tracking-widest !focus:ring-0 !focus:outline-none"
                value={color.hex}
                onChange={handleChangeColor}
                disabled={disabled}
              />

              <Input
                id={id}
                type="text"
                min="0"
                max="1"
                step="0.01"
                value={color.alpha.toFixed(2)}
                onChange={handleChangeAlpha}
                className="w-20 md:w-[5vw] pl-1 pr-0 rounded-l-none! tracking-widest !focus:ring-0 !focus:outline-none"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
