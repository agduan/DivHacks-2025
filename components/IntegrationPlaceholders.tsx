'use client';

export default function IntegrationPlaceholders() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* XRPL Integration */}
      <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-blue/30 space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-xl font-bold text-neon-blue uppercase">XRPL Integration</h3>
            <p className="text-xs text-gray-400">Coming Soon</p>
          </div>
        </div>

        <p className="text-sm text-gray-300">
          Connect your RLUSD savings and investments to see real-time portfolio tracking and
          automated savings strategies.
        </p>

        <button
          disabled
          className="w-full bg-neon-blue/20 border-2 border-neon-blue text-neon-blue px-6 py-3 rounded font-bold uppercase opacity-50 cursor-not-allowed"
        >
          Connect XRPL Wallet
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Track RLUSD holdings</p>
          <p>• Automated savings transfers</p>
          <p>• Multi-currency projections</p>
        </div>
      </div>

      {/* Echo Monetization */}
      <div className="bg-retro-gray p-6 rounded-lg border-2 border-neon-pink/30 space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-xl font-bold text-neon-pink uppercase">Echo Premium</h3>
            <p className="text-xs text-gray-400">Unlock Advanced Features</p>
          </div>
        </div>

        <p className="text-sm text-gray-300">
          Upgrade to premium for unlimited what-if scenarios, multi-year forecasts, and
          personalized AI coaching.
        </p>

        <button
          disabled
          className="w-full bg-neon-pink/20 border-2 border-neon-pink text-neon-pink px-6 py-3 rounded font-bold uppercase opacity-50 cursor-not-allowed"
        >
          Upgrade to Premium
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Unlimited scenarios</p>
          <p>• 5-year+ projections</p>
          <p>• AI financial coach</p>
          <p>• Export & share reports</p>
        </div>
      </div>
    </div>
  );
}

