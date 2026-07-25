import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  showLabel = true,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine dynamic color shift
  let strokeColor = '#EF4444'; // Red for low
  let bgColor = 'bg-red-50 text-red-700 border-red-200';
  let labelText = 'Needs Critical Work';

  if (normalizedScore >= 75) {
    strokeColor = '#10B981'; // Green for high
    bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    labelText = 'High Conversion Potential';
  } else if (normalizedScore >= 50) {
    strokeColor = '#F5A623'; // Amber for mid
    bgColor = 'bg-amber-light text-amber-900 border-amber/30';
    labelText = 'Moderate Performance';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Score Counter */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold font-display text-navy-900 tracking-tight">
            {normalizedScore}
          </span>
          <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${bgColor}`}>
          {labelText}
        </div>
      )}
    </div>
  );
};
