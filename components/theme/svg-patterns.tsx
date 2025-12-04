'use client';

interface SVGPatternProps {
  patternId: string;
  className?: string;
  color?: string;
}

export function SVGPattern({ patternId, className = '', color = 'currentColor' }: SVGPatternProps) {
  if (!patternId) return null;

  const patterns: Record<string, JSX.Element> = {
    'pattern-dots': (
      <pattern id="pattern-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill={color} opacity="0.1" />
      </pattern>
    ),
    'pattern-grid': (
      <pattern id="pattern-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
      </pattern>
    ),
    'pattern-waves': (
      <pattern id="pattern-waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
        <path d="M0 10 Q25 20 50 10 T100 10" fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
      </pattern>
    ),
    'pattern-hexagons': (
      <pattern id="pattern-hexagons" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
      </pattern>
    ),
    'pattern-circles': (
      <pattern id="pattern-circles" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
      </pattern>
    ),
    'pattern-diagonal': (
      <pattern id="pattern-diagonal" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 40 L40 0" stroke={color} strokeWidth="1" opacity="0.1" />
      </pattern>
    ),
  };

  const pattern = patterns[patternId];
  if (!pattern) return null;

  return (
    <svg className={`absolute inset-0 -z-10 ${className}`} style={{ opacity: 0.3 }}>
      <defs>{pattern}</defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export const availablePatterns = [
  { id: 'pattern-dots', name: 'Dots' },
  { id: 'pattern-grid', name: 'Grid' },
  { id: 'pattern-waves', name: 'Waves' },
  { id: 'pattern-hexagons', name: 'Hexagons' },
  { id: 'pattern-circles', name: 'Circles' },
  { id: 'pattern-diagonal', name: 'Diagonal Lines' },
];

