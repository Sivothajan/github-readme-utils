'use client';
import { useState } from 'react';
import HEXColorPicker from '@/components/HEXColorPicker';

const Home = () => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#CADBA2');
  return (
    <div
      style={{ backgroundColor }}
      className="h-screen w-full flex flex-col items-center tracking-tight justify-center text-muted relative transition-colors duration-300 ease-in"
    >
      <HEXColorPicker
        id="backgroundColor"
        value={backgroundColor}
        onChange={setBackgroundColor}
      />
    </div>
  );
};

export default Home;
