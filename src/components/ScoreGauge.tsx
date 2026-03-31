import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getGaugeColor(score: number): string {
  if (score >= 750) return "hsl(var(--score-good))";
  if (score >= 650) return "hsl(var(--score-average))";
  return "hsl(var(--score-poor))";
}

function getGaugeTrailColor(score: number): string {
  if (score >= 750) return "hsl(var(--score-good) / 0.15)";
  if (score >= 650) return "hsl(var(--score-average) / 0.15)";
  return "hsl(var(--score-poor) / 0.15)";
}

export function ScoreGauge({ score, size = 200 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(1);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semicircle
  const center = size / 2;

  // Score ranges from 300-900; normalize 600-900 for our mock
  const minScore = 300;
  const maxScore = 900;
  const percentage = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));

  useEffect(() => {
    // Animate score number
    const duration = 1500;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedScore(Math.round(eased * score));
      setDashOffset(1 - eased * percentage);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [score, percentage]);

  const color = getGaugeColor(score);
  const trailColor = getGaugeTrailColor(score);

  return (
    <div className="relative" style={{ width: size, height: size * 0.65 }}>
      <svg
        width={size}
        height={size * 0.65}
        viewBox={`0 0 ${size} ${size * 0.65}`}
        className="overflow-visible"
      >
        {/* Trail arc */}
        <path
          d={`M ${strokeWidth / 2} ${center * 0.95} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center * 0.95}`}
          fill="none"
          stroke={trailColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active arc */}
        <path
          d={`M ${strokeWidth / 2} ${center * 0.95} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center * 0.95}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * dashOffset}
          style={{ transition: "stroke 0.3s" }}
        />
        {/* Labels */}
        <text x={strokeWidth / 2} y={center * 0.95 + 20} textAnchor="start" className="fill-muted-foreground text-[10px]">
          300
        </text>
        <text x={size - strokeWidth / 2} y={center * 0.95 + 20} textAnchor="end" className="fill-muted-foreground text-[10px]">
          900
        </text>
      </svg>
      {/* Score in center */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-2"
        style={{ height: size * 0.65 }}
      >
        <span
          className="font-heading text-5xl font-bold leading-none"
          style={{ color }}
        >
          {animatedScore}
        </span>
      </div>
    </div>
  );
}
