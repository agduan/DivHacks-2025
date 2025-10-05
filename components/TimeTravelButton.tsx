'use client';

import { useState, useEffect } from 'react';

interface TimeTravelButtonProps {
  onTimeTravel: () => Promise<void>;
  loading: boolean;
  dinoAnimation: 'walk' | 'run' | 'hurt';
  timelineMonths: number;
  onTimelineAdvance?: (months: number) => void;
}

export default function TimeTravelButton({ 
  onTimeTravel, 
  loading, 
  dinoAnimation, 
  timelineMonths,
  onTimelineAdvance 
}: TimeTravelButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeTravelProgress, setTimeTravelProgress] = useState(0);

  // Handle time travel animation
  const handleTimeTravel = async () => {
    setIsAnimating(true);
    setTimeTravelProgress(0);
    
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setTimeTravelProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    await onTimeTravel();
    
    // Advance timeline by 1 year (12 months)
    if (onTimelineAdvance) {
      onTimelineAdvance(timelineMonths + 12);
    }
    
    setIsAnimating(false);
    setTimeTravelProgress(0);
  };

  // Reset animation state when dino animation changes
  useEffect(() => {
    if (dinoAnimation === 'walk' && isAnimating) {
      setIsAnimating(false);
    }
  }, [dinoAnimation, isAnimating]);

  return (
    <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-green/50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neon-green uppercase tracking-wider font-vcr mb-4">
          ⏰ Time Travel Controls
        </h2>
        
        {/* Progress Bar */}
        {isAnimating && (
          <div className="mb-4">
            <div className="bg-retro-darker rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-100 ease-out"
                style={{ width: `${timeTravelProgress}%` }}
              />
            </div>
            <p className="text-neon-blue text-sm mt-2 font-vcr">
              CALCULATING FUTURE... {timeTravelProgress}%
            </p>
          </div>
        )}

        {/* Time Travel Button */}
        <button
          onClick={handleTimeTravel}
          disabled={loading || isAnimating}
          className={`
            relative px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wider
            transition-all duration-300 transform
            ${loading || isAnimating
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-neon-blue to-neon-green text-retro-dark hover:from-neon-green hover:to-neon-blue hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]'
            }
            ${dinoAnimation === 'run' ? 'animate-pulse' : ''}
            ${dinoAnimation === 'hurt' ? 'animate-bounce' : ''}
          `}
        >
          {loading || isAnimating ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              TRAVELING TO FUTURE...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              🚀 TRAVEL TO NEXT YEAR
            </span>
          )}
        </button>

        {/* Timeline Info */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Current Timeline: <span className="text-neon-blue font-bold">{timelineMonths} months</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Click to advance timeline and get AI predictions
          </p>
        </div>

        {/* Time Travel Effects */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-neon-green/20 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
      </div>
    </div>
  );
}
