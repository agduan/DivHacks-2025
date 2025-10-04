import { AvatarState } from '@/types/financial';

interface AvatarProps {
  state: AvatarState;
  label: string;
  netWorth: number;
  savings: number;
  debt: number;
}

const avatarStyles = {
  struggling: {
    color: '#ff4444',
    emoji: '😰',
    glow: 'shadow-[0_0_20px_rgba(255,68,68,0.5)]',
  },
  stable: {
    color: '#ffaa00',
    emoji: '😊',
    glow: 'shadow-[0_0_20px_rgba(255,170,0,0.5)]',
  },
  thriving: {
    color: '#00ff41',
    emoji: '😎',
    glow: 'shadow-[0_0_20px_rgba(0,255,65,0.5)]',
  },
  wealthy: {
    color: '#00f0ff',
    emoji: '🤑',
    glow: 'shadow-[0_0_20px_rgba(0,240,255,0.5)]',
  },
};

export default function Avatar({ state, label, netWorth, savings, debt }: AvatarProps) {
  const style = avatarStyles[state];

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-retro-gray rounded-lg border-2 border-neon-blue/30">
      {/* Avatar Display */}
      <div className={`relative ${style.glow} animate-float`}>
        <div
          className="w-32 h-32 rounded-lg flex items-center justify-center text-6xl"
          style={{
            backgroundColor: `${style.color}22`,
            border: `3px solid ${style.color}`,
          }}
        >
          {style.emoji}
        </div>
        
        {/* Pixel corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-neon-blue"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-blue"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-neon-blue"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-blue"></div>
      </div>

      {/* Label */}
      <h3 className="text-neon-blue font-bold text-lg uppercase tracking-wider">
        {label}
      </h3>

      {/* Stats */}
      <div className="w-full space-y-2 text-sm">
        <div className="flex justify-between items-center p-2 bg-retro-darker rounded">
          <span className="text-gray-400">Net Worth:</span>
          <span
            className="font-bold"
            style={{ color: netWorth >= 0 ? '#00ff41' : '#ff4444' }}
          >
            ${netWorth.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-retro-darker rounded">
          <span className="text-gray-400">Savings:</span>
          <span className="text-neon-green font-bold">
            ${savings.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-retro-darker rounded">
          <span className="text-gray-400">Debt:</span>
          <span className="text-neon-pink font-bold">
            ${debt.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className="px-4 py-1 rounded-full text-xs font-bold uppercase"
        style={{
          backgroundColor: `${style.color}33`,
          color: style.color,
          border: `1px solid ${style.color}`,
        }}
      >
        {state}
      </div>
    </div>
  );
}

