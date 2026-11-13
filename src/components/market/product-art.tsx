import type { ArtHue, ArtKind } from "@/lib/market/catalog";

/**
 * Generated preview art for STAGING products. Original, deterministic SVG compositions, so the
 * marketplace has believable imagery without borrowing anyone's artwork. Real listings will show
 * the merchant's uploaded previews instead. Hues live only inside product imagery, never in UI chrome.
 */
const HUES: Record<ArtHue, string> = {
  amber: "#f2b35b",
  coral: "#f07a5f",
  sky: "#6cb6ff",
  violet: "#a78bfa",
  rose: "#f472b6",
  emerald: "#4ade80",
  mint: "#65e5d0",
};

function rng(seed: number) {
  let a = seed * 9301 + 49297;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Props = { kind: ArtKind; hue: ArtHue; seed: number; className?: string; variant?: number; label?: string };

export function ProductArt({ kind, hue, seed, className, variant = 0, label }: Props) {
  const c = HUES[hue];
  const r = rng(seed + variant * 101);
  const id = `a${seed}-${variant}-${kind}`;
  return (
    <svg viewBox="0 0 400 300" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`${id}-g`} cx={0.3 + r() * 0.4} cy={0.25 + r() * 0.3} r="0.9">
          <stop offset="0" stopColor={c} stopOpacity="0.38" />
          <stop offset="0.55" stopColor="#202631" stopOpacity="0.9" />
          <stop offset="1" stopColor="#090b0f" />
        </radialGradient>
        <pattern id={`${id}-p`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#f4f5f7" strokeOpacity="0.05" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-g)`} />
      <rect width="400" height="300" fill={`url(#${id}-p)`} />
      {ART[kind](c, r, id)}
    </svg>
  );
}

type Draw = (c: string, r: () => number, id: string) => React.ReactNode;

function isoBox(x: number, y: number, w: number, h: number, c: string, key: string) {
  const dx = w * 0.866;
  const dy = w * 0.5;
  return (
    <g key={key}>
      <path d={`M${x} ${y} l${dx} ${-dy} l${dx} ${dy} l${-dx} ${dy}z`} fill={c} fillOpacity="0.95" />
      <path d={`M${x} ${y} l${dx} ${dy} v${h} l${-dx} ${-dy}z`} fill={c} fillOpacity="0.62" />
      <path d={`M${x + dx} ${y + dy} l${dx} ${-dy} v${h} l${-dx} ${dy}z`} fill={c} fillOpacity="0.36" />
      <path d={`M${x} ${y} l${dx} ${-dy} l${dx} ${dy} l${-dx} ${dy}z`} fill="none" stroke="#f4f5f7" strokeOpacity="0.35" />
    </g>
  );
}

const ART: Record<ArtKind, Draw> = {
  cube: (c, r) => {
    const boxes = [
      [150, 150, 52, 70],
      [96, 186, 34, 40],
      [230, 196, 40, 46],
      [196, 118, 26, 30],
    ].map(([x, y, w, h], i) => isoBox(x + (r() - 0.5) * 14, y + (r() - 0.5) * 10, w, h + r() * 20, c, `b${i}`));
    return (
      <>
        <ellipse cx="200" cy="262" rx="150" ry="22" fill="#090b0f" fillOpacity="0.6" />
        <path d="M60 230 L200 160 L340 230 L200 300z" fill="#f4f5f7" fillOpacity="0.04" stroke="#f4f5f7" strokeOpacity="0.12" />
        {boxes}
      </>
    );
  },
  pattern: (c, r) => (
    <g>
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const x = col * 56 - 20 + (row % 2) * 28;
          const y = row * 56 - 10;
          const s = 16 + r() * 6;
          return (
            <g key={`${row}-${col}`} transform={`translate(${x} ${y})`}>
              <path d={`M0 ${-s} L${s} 0 L0 ${s} L${-s} 0z`} fill="none" stroke={c} strokeOpacity="0.7" strokeWidth="2" />
              <circle r={s * 0.32} fill={c} fillOpacity="0.55" />
              <path d={`M${-s} ${-s} q${s} ${s * 0.6} ${2 * s} 0`} fill="none" stroke="#f4f5f7" strokeOpacity="0.18" />
            </g>
          );
        }),
      )}
      <rect x="70" y="70" width="260" height="160" rx="14" fill="#090b0f" fillOpacity="0.55" stroke="#f4f5f7" strokeOpacity="0.2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={90 + i * 58} y="90" width="48" height="120" rx="8" fill={c} fillOpacity={0.25 + i * 0.18} />
      ))}
    </g>
  ),
  ui: (c, r) => {
    const pts = Array.from({ length: 8 }, (_, i) => `${150 + i * 26},${190 - r() * 60}`).join(" ");
    return (
      <g>
        <rect x="40" y="38" width="320" height="226" rx="12" fill="#090b0f" fillOpacity="0.85" stroke="#f4f5f7" strokeOpacity="0.18" />
        <rect x="40" y="38" width="320" height="24" rx="12" fill="#202631" />
        {[0, 1, 2].map((i) => <circle key={i} cx={56 + i * 12} cy="50" r="3.5" fill="#f4f5f7" fillOpacity="0.3" />)}
        <rect x="52" y="74" width="70" height="178" rx="8" fill="#202631" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="62" y={88 + i * 22} width={i === 1 ? 50 : 40} height="8" rx="4" fill={i === 1 ? c : "#f4f5f7"} fillOpacity={i === 1 ? 0.9 : 0.25} />)}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={134 + i * 72} y="74" width="64" height="44" rx="8" fill="#202631" />
            <rect x={142 + i * 72} y="84" width="28" height="6" rx="3" fill="#f4f5f7" fillOpacity="0.3" />
            <rect x={142 + i * 72} y="98" width={20 + r() * 26} height="10" rx="3" fill={i === 0 ? c : "#f4f5f7"} fillOpacity={i === 0 ? 0.9 : 0.6} />
          </g>
        ))}
        <rect x="134" y="128" width="208" height="124" rx="8" fill="#202631" />
        <polyline points={pts} fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <polygon points={`150,240 ${pts} 332,240`} fill={c} fillOpacity="0.14" />
      </g>
    );
  },
  template: (c, r) => (
    <g>
      <g transform="rotate(-6 200 150)">
        <rect x="70" y="40" width="200" height="236" rx="10" fill="#202631" stroke="#f4f5f7" strokeOpacity="0.14" />
      </g>
      <rect x="120" y="30" width="210" height="240" rx="10" fill="#f4f5f7" fillOpacity="0.96" />
      <rect x="138" y="48" width="174" height="96" rx="6" fill={c} />
      <circle cx={190 + r() * 80} cy="96" r="26" fill="#090b0f" fillOpacity="0.25" />
      <rect x="138" y="158" width="130" height="14" rx="3" fill="#090b0f" fillOpacity="0.85" />
      <rect x="138" y="180" width="96" height="14" rx="3" fill="#090b0f" fillOpacity="0.85" />
      {[0, 1, 2].map((i) => <rect key={i} x="138" y={206 + i * 12} width={150 - i * 22} height="5" rx="2.5" fill="#202631" fillOpacity="0.45" />)}
      <rect x="252" y="236" width="60" height="20" rx="10" fill={c} />
    </g>
  ),
  graphic: (c, r) => (
    <g>
      <circle cx={160 + r() * 30} cy="140" r="78" fill={c} fillOpacity="0.85" />
      <circle cx={240 + r() * 20} cy="168" r="56" fill="none" stroke="#f4f5f7" strokeWidth="3" strokeOpacity="0.85" />
      <path d="M90 230 C 150 170, 250 290, 320 210" fill="none" stroke="#f4f5f7" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.9" />
      <path d="M286 70 l8 18 l20 2 l-15 13 l5 20 l-18 -11 l-18 11 l5 -20 l-15 -13 l20 -2z" fill="#f4f5f7" />
      <rect x="66" y="64" width="40" height="40" rx="8" fill="#090b0f" fillOpacity="0.6" stroke={c} strokeWidth="3" />
    </g>
  ),
  audio: (c, r) => (
    <g>
      <circle cx="96" cy="150" r="62" fill="#090b0f" stroke="#f4f5f7" strokeOpacity="0.2" />
      <circle cx="96" cy="150" r="40" fill="none" stroke="#f4f5f7" strokeOpacity="0.08" strokeWidth="10" />
      <circle cx="96" cy="150" r="16" fill={c} />
      {Array.from({ length: 30 }, (_, i) => {
        const h = 10 + Math.abs(Math.sin(i * 0.55 + r() * 3)) * 70 * (0.5 + r() * 0.5);
        return <rect key={i} x={176 + i * 6.4} y={150 - h / 2} width="3.6" height={h} rx="1.8" fill={i % 7 === 0 ? "#f4f5f7" : c} fillOpacity={i > 20 ? 0.45 : 0.95} />;
      })}
      <rect x="176" y="232" width="190" height="4" rx="2" fill="#f4f5f7" fillOpacity="0.15" />
      <rect x="176" y="232" width="128" height="4" rx="2" fill={c} />
    </g>
  ),
  video: (c, r) => (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 90} y="60" width="82" height="110" rx="8" fill={i === 1 ? c : "#202631"} fillOpacity={i === 1 ? 0.9 : 1} stroke="#f4f5f7" strokeOpacity="0.12" />
      ))}
      <path d="M158 96 l30 19 l-30 19z" fill="#090b0f" />
      <rect x="30" y="196" width="340" height="40" rx="8" fill="#090b0f" fillOpacity="0.7" stroke="#f4f5f7" strokeOpacity="0.12" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={40 + i * 37} y={204 + (i % 2) * 6} width={18 + r() * 14} height="12" rx="3" fill={i % 3 === 0 ? c : "#f4f5f7"} fillOpacity={i % 3 === 0 ? 0.85 : 0.25} />)}
      <rect x={120 + r() * 120} y="188" width="3" height="56" fill="#f4f5f7" />
    </g>
  ),
  plugin: (c) => (
    <g>
      {[
        [60, 70, "#202631"],
        [60, 180, "#202631"],
        [230, 120, c],
      ].map(([x, y, f], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width="110" height="62" rx="10" fill={f as string} fillOpacity={i === 2 ? 0.92 : 1} stroke="#f4f5f7" strokeOpacity="0.16" />
          <rect x={(x as number) + 14} y={(y as number) + 16} width="56" height="7" rx="3.5" fill={i === 2 ? "#090b0f" : "#f4f5f7"} fillOpacity={i === 2 ? 0.7 : 0.35} />
          <rect x={(x as number) + 14} y={(y as number) + 32} width="80" height="6" rx="3" fill={i === 2 ? "#090b0f" : "#f4f5f7"} fillOpacity={i === 2 ? 0.4 : 0.18} />
          <circle cx={(x as number) + (i === 2 ? 0 : 110)} cy={(y as number) + 31} r="6" fill="#f4f5f7" />
        </g>
      ))}
      <path d="M170 101 C 200 101, 200 151, 230 151" fill="none" stroke="#f4f5f7" strokeWidth="2.5" strokeOpacity="0.7" />
      <path d="M170 211 C 200 211, 200 151, 230 151" fill="none" stroke="#f4f5f7" strokeWidth="2.5" strokeOpacity="0.7" />
    </g>
  ),
  code: (c, r) => (
    <g>
      <rect x="48" y="44" width="304" height="212" rx="12" fill="#090b0f" fillOpacity="0.88" stroke="#f4f5f7" strokeOpacity="0.16" />
      {Array.from({ length: 10 }, (_, i) => {
        const indent = [0, 1, 2, 2, 1, 2, 3, 2, 1, 0][i] * 18;
        return (
          <g key={i}>
            <rect x="64" y={66 + i * 18} width="14" height="6" rx="3" fill="#f4f5f7" fillOpacity="0.15" />
            <rect x={92 + indent} y={66 + i * 18} width={26 + r() * 40} height="6" rx="3" fill={c} fillOpacity="0.9" />
            <rect x={128 + indent + r() * 30} y={66 + i * 18} width={30 + r() * 80} height="6" rx="3" fill="#f4f5f7" fillOpacity="0.45" />
          </g>
        );
      })}
    </g>
  ),
  service: (c) => (
    <g>
      <path d="M70 220 C 120 60, 260 60, 330 190" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" />
      <path d="M70 220 L 150 80 M330 190 L 290 70" stroke="#f4f5f7" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="4 6" />
      {[
        [70, 220],
        [330, 190],
      ].map(([x, y], i) => <rect key={i} x={x - 9} y={y - 9} width="18" height="18" fill="#f4f5f7" stroke="#090b0f" strokeWidth="3" />)}
      {[
        [150, 80],
        [290, 70],
      ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" fill="#090b0f" stroke="#f4f5f7" strokeWidth="3" />)}
      <path d="M200 120 l46 92 l-20 -4 l14 30 l-12 6 l-14 -30 l-14 14z" fill="#f4f5f7" stroke="#090b0f" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
};
