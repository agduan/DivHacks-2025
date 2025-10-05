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
    color: '#cc6666',
    image: '/avatar/poor.png',
    glow: 'shadow-[0_0_15px_rgba(204,102,102,0.3)]',
  },
  stable: {
    color: '#ccaa66',
    image: '/avatar/normal.png',
    glow: 'shadow-[0_0_15px_rgba(204,170,102,0.3)]',
  },
  thriving: {
    color: '#66cc88',
    image: '/avatar/normal.png',
    glow: 'shadow-[0_0_15px_rgba(102,204,136,0.3)]',
  },
  wealthy: {
    color: '#4a9eff',
    image: '/avatar/rich.png',
    glow: 'shadow-[0_0_15px_rgba(74,158,255,0.3)]',
  },
};

export default function Avatar({ state, label, netWorth, savings, debt }: AvatarProps) {
  const style = avatarStyles[state];

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-retro-gray rounded-lg border-2 border-neon-blue/30">
      {/* Avatar Display */}
      <div className={`relative ${style.glow} animate-float`}>
        <div
          className="w-48 h-48 rounded-lg flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: `${style.color}22`,
            border: `3px solid ${style.color}`,
          }}
        >
          <img 
            src={style.image} 
            alt={`${state} avatar`}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        {/* Pixel corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-neon-blue"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-blue"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-neon-blue"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-blue"></div>
      </div>

      {/* Label */}
      <h3 className="text-neon-blue font-bold text-lg uppercase tracking-wider font-vcr">
        {label}
      </h3>

      {/* Stats */}
      <div className="w-full space-y-2 text-sm">
        <div className="flex justify-between items-center p-2 bg-retro-darker rounded">
          <span className="text-gray-400">Net Worth:</span>
          <span
            className="font-bold"
            style={{ color: netWorth >= 0 ? '#66cc88' : '#cc6666' }}
          >
            ${netWorth.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-retro-darker rounded">
          <span className="text-gray-400">Savings:</span>
          <span className="text-neon-green font-bold">
            ${savings.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-retro-darker rounded">
          <span className="text-gray-400">Debt:</span>
          <span className="text-neon-pink font-bold">
            ${debt.toFixed(2)}
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

