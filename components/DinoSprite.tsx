'use client';

import { useEffect } from 'react';

interface DinoSpriteProps {
  variant: 'doux' | 'mort' | 'vita' | 'tard';
  animation: 'walk' | 'run' | 'hurt';
  className?: string;
}

export default function DinoSprite({ variant, animation, className = '' }: DinoSpriteProps) {
  // Debug logging
  useEffect(() => {
    console.log(`🦕 Dino animation changed to: ${animation}`);
  }, [animation]);

  // Map variant names to file names
  const spriteMap = {
    doux: 'doux',
    mort: 'mort',
    vita: 'vita',
    tard: 'tard',
  };

  const spriteName = spriteMap[variant];

  return (
    <div 
      className={`dino-sprite dino-sprite-${spriteName} dino-anim-${animation} ${className}`}
      style={{
        width: '96px',
        height: '96px',
        imageRendering: 'pixelated',
      }}
      title={`Dino: ${animation}`}
    />
  );
}
