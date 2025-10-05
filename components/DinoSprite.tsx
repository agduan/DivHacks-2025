'use client';

interface DinoSpriteProps {
  variant: 'doux' | 'mort' | 'vita' | 'tard';
  animation: 'walk' | 'run' | 'hurt';
  className?: string;
}

export default function DinoSprite({ variant, animation, className = '' }: DinoSpriteProps) {
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
        width: '24px',
        height: '24px',
        imageRendering: 'pixelated',
        transform: 'scale(2.5)',
      }}
    />
  );
}
