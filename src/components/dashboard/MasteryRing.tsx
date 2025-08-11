import React from "react";

interface MasteryRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-100
  className?: string;
}

export const MasteryRing: React.FC<MasteryRingProps> = ({
  size = 48,
  strokeWidth = 6,
  progress,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 100) / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`Mastery ${Math.round(progress)}%`}
    >
      <defs>
        <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--ring-foreground, var(--primary)))" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#ringGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 200ms ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.32}
        fill="hsl(var(--foreground))"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default MasteryRing;
