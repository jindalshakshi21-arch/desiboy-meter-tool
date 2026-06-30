interface TirangaLogoProps {
  size?: number;
  className?: string;
}

export default function TirangaLogo({ size = 72, className = "" }: TirangaLogoProps) {
  const W = size * 1.5;
  const H = size;
  const cx = W / 2;
  const cy = H / 2;
  const stripeH = H / 3;
  const chakraR = H * 0.28;
  const innerR = chakraR * 0.12;
  const spokeR = chakraR * 0.82;
  const SPOKES = 24;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <clipPath id="flag-round">
          <rect width={W} height={H} rx={W * 0.07} ry={H * 0.1} />
        </clipPath>
        <filter id="flag-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
        </filter>
      </defs>

      <g clipPath="url(#flag-round)" filter="url(#flag-shadow)">
        {/* Saffron stripe */}
        <rect x={0} y={0} width={W} height={stripeH} fill="#FF9933" />
        {/* White stripe */}
        <rect x={0} y={stripeH} width={W} height={stripeH} fill="#FFFFFF" />
        {/* Green stripe */}
        <rect x={0} y={stripeH * 2} width={W} height={stripeH} fill="#138808" />

        {/* Ashoka Chakra — outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={chakraR}
          fill="none"
          stroke="#000080"
          strokeWidth={chakraR * 0.11}
        />

        {/* 24 spokes */}
        {Array.from({ length: SPOKES }, (_, i) => {
          const angle = ((i * 360) / SPOKES - 90) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + spokeR * Math.cos(angle)}
              y2={cy + spokeR * Math.sin(angle)}
              stroke="#000080"
              strokeWidth={chakraR * 0.07}
              strokeLinecap="round"
            />
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={innerR} fill="#000080" />
      </g>

      {/* Border */}
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={W * 0.07}
        ry={H * 0.1}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={1}
      />
    </svg>
  );
}
