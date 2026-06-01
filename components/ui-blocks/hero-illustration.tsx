"use client";

import { motion } from "framer-motion";

// ── Public preset catalogue (used by AdminPanel picker) ───────────────────────

export const ILLUSTRATION_PRESETS = [
  { id: "person-learning",    label: "Learning",    emoji: "📖" },
  { id: "person-laptop",      label: "Online",      emoji: "💻" },
  { id: "person-teaching",    label: "Teaching",    emoji: "🎓" },
  { id: "person-thinking",    label: "Thinking",    emoji: "💡" },
  { id: "person-achievement", label: "Achievement", emoji: "🏆" },
  { id: "person-team",        label: "Team",        emoji: "🤝" },
] as const;

export type IllustrationPresetId = typeof ILLUSTRATION_PRESETS[number]["id"];

// ── Main export ───────────────────────────────────────────────────────────────

interface HeroIllustrationProps {
  illustrationUrl?: string | null;
  illustrationPreset?: string | null;
  style?: string;
  dark?: boolean;
}

const slideIn = {
  initial: { opacity: 0, x: 36 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.65, ease: "easeOut" as const },
};

const floatAnim = (delay = 0, range = 12, duration = 3.5) => ({
  animate: { y: [0, -range, 0] },
  transition: { duration, delay, repeat: Infinity, ease: "easeInOut" as const },
});

export function HeroIllustration({
  illustrationUrl,
  illustrationPreset,
  style = "default",
  dark = false,
}: HeroIllustrationProps) {
  // Custom uploaded image takes priority
  if (illustrationUrl) {
    return (
      <motion.div {...slideIn} className="relative flex w-full items-center justify-center">
        <img
          src={illustrationUrl}
          alt=""
          className="h-auto max-h-96 w-full object-contain drop-shadow-2xl"
        />
      </motion.div>
    );
  }

  // Named preset
  if (illustrationPreset) {
    switch (illustrationPreset as IllustrationPresetId) {
      case "person-learning":    return <PersonLearning />;
      case "person-laptop":      return <PersonLaptop />;
      case "person-teaching":    return <PersonTeaching />;
      case "person-thinking":    return <PersonThinking />;
      case "person-achievement": return <PersonAchievement />;
      case "person-team":        return <PersonTeam />;
    }
  }

  // Fall back to abstract themed illustration based on hero style
  if (style === "expert" || style === "expert-academy") return <PersonTeaching />;
  if (style === "creator-store" || style === "creator")  return <PersonLaptop />;
  if (style === "social")       return <PersonTeam />;
  if (style === "community")    return <PersonTeam />;
  if (style === "dark-programmer") return <PersonLaptop dark />;
  return <PersonLearning />;
}

// ─────────────────────────────────────────────────────────────────────────────
// People illustrations — Storyset-inspired flat design
// ─────────────────────────────────────────────────────────────────────────────

/* Shared skin / hair tokens */
const SKIN  = "#FBBF7A";
const HAIR  = "#2D3748";
const DARK  = "#1A202C";
const STAR  = "#F6E05E";

// ── 1. Person Learning ────────────────────────────────────────────────────────

function PersonLearning() {
  return (
    <motion.div {...slideIn} className="w-full max-w-lg select-none" aria-hidden>
      <svg viewBox="0 0 500 500" fill="none" className="w-full h-auto">
        {/* Blob background */}
        <path d="M250 45 C350 45 435 125 438 228 C441 331 372 425 258 432 C144 439 52 362 44 258 C36 154 104 62 204 48 C220 45 235 45 250 45Z"
          fill="var(--theme-primary)" opacity="0.12" />

        {/* Shadow */}
        <ellipse cx="252" cy="436" rx="98" ry="16" fill={DARK} opacity="0.07" />

        {/* Open book on lap */}
        <g transform="translate(168,320)">
          <path d="M0 10 Q82 0 164 10 L164 110 Q82 98 0 110Z" fill="white" />
          <path d="M0 10 Q40 2 82 10 L82 110 Q40 100 0 110Z" fill="var(--theme-primary)" opacity="0.18" />
          <path d="M82 10 Q123 2 164 10 L164 110 Q123 100 82 110Z" fill="var(--theme-secondary)" opacity="0.18" />
          <line x1="82" y1="10" x2="82" y2="110" stroke="var(--theme-primary)" strokeWidth="2" opacity="0.4" />
          {[30,46,62,78].map(y => <line key={y} x1="12" y1={y} x2="70" y2={y} stroke="var(--theme-primary)" strokeWidth="2" opacity="0.35" />)}
          {[30,46,62,78].map(y => <line key={y} x1="94" y1={y} x2="152" y2={y} stroke="var(--theme-secondary)" strokeWidth="2" opacity="0.35" />)}
        </g>

        {/* Crossed legs */}
        <path d="M188 370 Q162 398 155 428 Q200 442 242 422 Q250 400 258 422 Q300 442 345 428 Q338 398 312 370 Q282 348 250 360 Q218 348 188 370Z"
          fill={HAIR} />
        {/* Shoes */}
        <ellipse cx="162" cy="432" rx="20" ry="10" fill={STAR} />
        <ellipse cx="338" cy="432" rx="20" ry="10" fill={STAR} />

        {/* Body */}
        <path d="M202 278 Q208 355 212 368 Q240 378 262 378 Q292 378 290 368 Q294 355 300 278 Q276 268 250 272 Q224 268 202 278Z"
          fill="var(--theme-primary)" />

        {/* Arms holding book */}
        <path d="M208 296 Q172 315 155 348 Q168 368 186 360 Q200 334 215 312Z" fill="var(--theme-primary)" />
        <path d="M292 296 Q328 315 345 348 Q332 368 314 360 Q300 334 285 312Z" fill="var(--theme-primary)" />
        <ellipse cx="154" cy="355" rx="15" ry="12" fill={SKIN} />
        <ellipse cx="346" cy="355" rx="15" ry="12" fill={SKIN} />

        {/* Neck */}
        <rect x="236" y="248" width="28" height="32" rx="12" fill={SKIN} />

        {/* Head */}
        <circle cx="250" cy="210" r="56" fill={SKIN} />

        {/* Hair */}
        <path d="M197 198 Q200 148 250 142 Q300 148 303 198 Q292 162 250 160 Q208 162 197 198Z" fill={HAIR} />

        {/* Eyes */}
        <circle cx="232" cy="210" r="6" fill={DARK} />
        <circle cx="268" cy="210" r="6" fill={DARK} />
        <circle cx="234" cy="208" r="2" fill="white" />
        <circle cx="270" cy="208" r="2" fill="white" />

        {/* Smile */}
        <path d="M234 228 Q250 244 266 228" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Floating elements */}
        <motion.g {...floatAnim(0, 14, 4.2)}>
          <g transform="translate(72,110) rotate(-18)">
            <rect x="0" y="0" width="44" height="56" rx="5" fill="var(--theme-secondary)" opacity="0.85" />
            {[10,20,30,40].map(y => <rect key={y} x="6" y={y} width="32" height="3" rx="1.5" fill="white" opacity="0.6" />)}
          </g>
        </motion.g>

        <motion.g {...floatAnim(0.9, 10, 3.6)}>
          <g transform="translate(368,88)">
            <path d="M22 0 L27 15 L42 15 L30 24 L35 40 L22 31 L9 40 L14 24 L2 15 L17 15Z" fill={STAR} opacity="0.9" />
          </g>
        </motion.g>

        <motion.g {...floatAnim(1.6, 8, 4.8)}>
          <g transform="translate(390,230) rotate(25)">
            <rect x="0" y="0" width="10" height="52" rx="3" fill={STAR} />
            <polygon points="0,52 10,52 5,66" fill={SKIN} />
            <rect x="0" y="0" width="10" height="8" rx="2" fill="#E53E3E" opacity="0.85" />
          </g>
        </motion.g>

        {[{ cx: 112, cy: 148, r: 8, c: "var(--theme-accent)" },
          { cx: 395, cy: 355, r: 6, c: "var(--theme-primary)" },
          { cx: 88,  cy: 350, r: 5, c: STAR }].map(({ cx, cy, r, c }, i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={r} fill={c} opacity={0.45}
            animate={{ opacity: [0.2, 0.6, 0.2], r: [r * 0.8, r * 1.2, r * 0.8] }}
            transition={{ duration: 2.2 + i * 0.4, repeat: Infinity, delay: i * 0.5 }} />
        ))}
      </svg>
    </motion.div>
  );
}

// ── 2. Person Laptop ──────────────────────────────────────────────────────────

function PersonLaptop({ dark = false }: { dark?: boolean }) {
  const surfaceBg = dark ? "#0f1629" : "#ffffff";
  const screenBg  = dark ? "#1e293b" : "#f1f5f9";

  return (
    <motion.div {...slideIn} className="w-full max-w-lg select-none" aria-hidden>
      <svg viewBox="0 0 500 500" fill="none" className="w-full h-auto">
        <path d="M252 42 C356 42 440 126 440 232 C440 338 366 428 256 432 C146 436 52 355 48 245 C44 135 118 50 222 44 C232 42 242 42 252 42Z"
          fill="var(--theme-primary)" opacity={dark ? 0.08 : 0.11} />

        <ellipse cx="255" cy="438" rx="110" ry="16" fill={DARK} opacity="0.07" />

        {/* Chair / stool */}
        <rect x="190" y="360" width="130" height="10" rx="5" fill={dark ? "#334155" : "#CBD5E0"} />
        <rect x="218" y="370" width="14" height="60" rx="4" fill={dark ? "#475569" : "#A0AEC0"} />
        <rect x="278" y="370" width="14" height="60" rx="4" fill={dark ? "#475569" : "#A0AEC0"} />
        <rect x="210" y="428" width="90" height="8" rx="4" fill={dark ? "#334155" : "#CBD5E0"} />

        {/* Laptop base */}
        <rect x="148" y="295" width="214" height="70" rx="8" fill={dark ? "#1e293b" : "#E2E8F0"} />
        <rect x="152" y="299" width="206" height="62" rx="6" fill={surfaceBg} />
        <rect x="148" y="360" width="214" height="10" rx="4" fill={dark ? "#0f172a" : "#CBD5E0"} />
        <rect x="180" y="368" width="150" height="5" rx="2.5" fill={dark ? "#1e293b" : "#A0AEC0"} />

        {/* Screen content */}
        <rect x="156" y="302" width="198" height="56" rx="4" fill={screenBg} />
        <defs>
          <linearGradient id="pl-bar" x1="156" y1="302" x2="354" y2="302" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--theme-primary)" />
            <stop offset="1" stopColor="var(--theme-secondary)" />
          </linearGradient>
        </defs>
        <rect x="156" y="302" width="90" height="56" rx="4" fill="url(#pl-bar)" opacity="0.8" />
        {/* Play btn on screen */}
        <circle cx="201" cy="330" r="14" fill="white" opacity="0.92" />
        <path d="M197 323 L211 330 L197 337Z" fill="var(--theme-primary)" />
        {[{ x: 256, w: 60 }, { x: 256, w: 46 }, { x: 256, w: 52 }].map(({ x, w }, i) => (
          <rect key={i} x={x} y={316 + i * 14} width={w} height="6" rx="2"
            fill={dark ? "#475569" : "#CBD5E0"} />
        ))}

        {/* Legs sitting */}
        <path d="M196 332 Q186 360 186 380 Q220 388 250 375 Q280 388 314 380 Q314 360 304 332Z"
          fill={dark ? "#1e293b" : "#E2E8F0"} />
        <path d="M196 332 Q186 360 186 380 Q220 388 250 375 Q280 388 314 380 Q314 360 304 332Z"
          fill={HAIR} opacity="0.6" />
        <ellipse cx="186" cy="382" rx="18" ry="10" fill="var(--theme-primary)" opacity="0.85" />
        <ellipse cx="314" cy="382" rx="18" ry="10" fill="var(--theme-primary)" opacity="0.85" />

        {/* Body */}
        <path d="M206 238 Q198 300 200 332 Q228 340 252 340 Q276 340 300 332 Q302 300 294 238 Q272 228 250 230 Q228 228 206 238Z"
          fill="var(--theme-primary)" />

        {/* Arms */}
        <path d="M208 250 Q175 268 162 298 Q172 314 188 308 Q198 282 214 264Z" fill="var(--theme-primary)" />
        <path d="M292 250 Q325 268 338 298 Q328 314 312 308 Q302 282 286 264Z" fill="var(--theme-primary)" />
        <ellipse cx="160" cy="302" rx="14" ry="12" fill={SKIN} />
        <ellipse cx="340" cy="302" rx="14" ry="12" fill={SKIN} />

        {/* Neck */}
        <rect x="236" y="206" width="28" height="32" rx="12" fill={SKIN} />

        {/* Head */}
        <circle cx="250" cy="172" r="56" fill={SKIN} />

        {/* Hair */}
        <path d="M197 158 Q200 108 250 102 Q300 108 303 158 Q292 122 250 120 Q208 122 197 158Z" fill={HAIR} />
        <path d="M197 158 Q190 145 194 132 Q200 122 207 125 Q200 130 200 142Z" fill={HAIR} />

        {/* Eyes excited wide */}
        <circle cx="232" cy="172" r="8" fill={DARK} />
        <circle cx="268" cy="172" r="8" fill={DARK} />
        <circle cx="235" cy="169" r="3" fill="white" />
        <circle cx="271" cy="169" r="3" fill="white" />

        {/* Big smile */}
        <path d="M226 192 Q250 214 274 192" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Raised right arm */}
        <path d="M292 250 Q318 200 330 172 Q320 158 310 166 Q305 188 290 224Z" fill="var(--theme-primary)" />
        <ellipse cx="333" cy="168" rx="14" ry="12" fill={SKIN} />

        {/* Floating wifi / stars */}
        <motion.g {...floatAnim(0, 12, 3.8)}>
          <g transform="translate(340, 96)">
            <path d="M22 30 Q22 22 30 22 Q38 22 38 30" stroke="var(--theme-accent)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M14 38 Q14 18 30 18 Q46 18 46 38" stroke="var(--theme-accent)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M6 46 Q6 10 30 10 Q54 10 54 46" stroke="var(--theme-accent)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
            <circle cx="30" cy="48" r="4" fill="var(--theme-accent)" />
          </g>
        </motion.g>

        <motion.g {...floatAnim(0.7, 10, 4.4)}>
          <path d="M82 138 L88 158 L108 158 L93 170 L99 190 L82 178 L65 190 L71 170 L56 158 L76 158Z"
            fill={STAR} opacity="0.9" />
        </motion.g>

        <motion.g {...floatAnim(1.5, 8, 3.5)}>
          <g transform="translate(72, 280)">
            <rect x="0" y="0" width="48" height="28" rx="14" fill={dark ? "#334155" : "white"} />
            <rect x="4" y="0" width="48" height="28" rx="14" fill={dark ? "#1e293b" : "#F7FAFC"} stroke={dark ? "#475569" : "#E2E8F0"} strokeWidth="1" />
            <rect x="10" y="10" width="28" height="8" rx="2" fill="var(--theme-primary)" opacity="0.5" />
          </g>
        </motion.g>

        {[{ cx: 410, cy: 160, r: 7 }, { cx: 392, cy: 320, r: 5 }].map(({ cx, cy, r }, i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={r} fill="var(--theme-primary)" opacity={0.4}
            animate={{ opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 2.4 + i * 0.5, repeat: Infinity, delay: i * 0.7 }} />
        ))}
      </svg>
    </motion.div>
  );
}

// ── 3. Person Teaching ────────────────────────────────────────────────────────

function PersonTeaching() {
  return (
    <motion.div {...slideIn} className="w-full max-w-lg select-none" aria-hidden>
      <svg viewBox="0 0 500 500" fill="none" className="w-full h-auto">
        <path d="M245 42 C348 42 432 124 436 230 C440 336 368 428 256 432 C144 436 52 355 48 244 C44 133 118 50 220 44 C228 42 237 42 245 42Z"
          fill="var(--theme-secondary)" opacity="0.12" />

        <ellipse cx="250" cy="440" rx="105" ry="16" fill={DARK} opacity="0.07" />

        {/* Whiteboard */}
        <rect x="56" y="88" width="210" height="148" rx="10" fill="white" />
        <rect x="56" y="88" width="210" height="148" rx="10" stroke="var(--theme-primary)" strokeWidth="3" fill="none" />
        <rect x="60" y="92" width="202" height="140" rx="8" fill="#F0FFF4" />
        {/* Board content */}
        <line x1="76" y1="122" x2="246" y2="122" stroke="var(--theme-primary)" strokeWidth="2" opacity="0.6" />
        <line x1="76" y1="140" x2="220" y2="140" stroke="var(--theme-primary)" strokeWidth="2" opacity="0.4" />
        <line x1="76" y1="158" x2="238" y2="158" stroke="var(--theme-primary)" strokeWidth="2" opacity="0.4" />
        {/* Chart on board */}
        <rect x="76" y="180" width="18" height="32" rx="2" fill="var(--theme-primary)" opacity="0.5" />
        <rect x="100" y="168" width="18" height="44" rx="2" fill="var(--theme-primary)" opacity="0.7" />
        <rect x="124" y="156" width="18" height="56" rx="2" fill="var(--theme-primary)" opacity="0.9" />
        <rect x="148" y="172" width="18" height="40" rx="2" fill="var(--theme-secondary)" opacity="0.7" />
        <rect x="172" y="160" width="18" height="52" rx="2" fill="var(--theme-secondary)" opacity="0.85" />
        {/* Star on board */}
        <path d="M215 168 L218 178 L228 178 L220 184 L223 194 L215 188 L207 194 L210 184 L202 178 L212 178Z"
          fill={STAR} opacity="0.9" />
        {/* Board stand */}
        <rect x="120" y="236" width="20" height="30" rx="4" fill="var(--theme-primary)" opacity="0.4" />
        <rect x="100" y="264" width="62" height="8" rx="4" fill="var(--theme-primary)" opacity="0.3" />

        {/* Person standing */}
        {/* Legs */}
        <rect x="316" y="350" width="28" height="90" rx="14" fill={HAIR} />
        <rect x="354" y="350" width="28" height="90" rx="14" fill={HAIR} />
        <ellipse cx="330" cy="440" rx="18" ry="10" fill="var(--theme-primary)" opacity="0.9" />
        <ellipse cx="368" cy="440" rx="18" ry="10" fill="var(--theme-primary)" opacity="0.9" />

        {/* Body */}
        <rect x="306" y="248" width="106" height="108" rx="28" fill="var(--theme-primary)" />

        {/* Left arm — raised pointing at board */}
        <path d="M310 270 Q272 240 250 218 Q242 206 252 200 Q262 196 272 208 Q292 232 316 258Z"
          fill="var(--theme-primary)" />
        <ellipse cx="248" cy="198" rx="14" ry="12" fill={SKIN} transform="rotate(-20 248 198)" />

        {/* Right arm — down */}
        <path d="M408 270 Q432 300 440 340 Q426 352 412 344 Q410 312 404 284Z"
          fill="var(--theme-primary)" />
        <ellipse cx="440" cy="344" rx="14" ry="12" fill={SKIN} />

        {/* Neck */}
        <rect x="345" y="216" width="28" height="34" rx="12" fill={SKIN} />

        {/* Head */}
        <circle cx="359" cy="182" r="56" fill={SKIN} />

        {/* Hair */}
        <path d="M306 168 Q310 118 359 112 Q408 118 412 168 Q400 132 359 130 Q318 132 306 168Z" fill={HAIR} />

        {/* Eyes */}
        <circle cx="342" cy="182" r="6" fill={DARK} />
        <circle cx="376" cy="182" r="6" fill={DARK} />
        <circle cx="344" cy="180" r="2" fill="white" />
        <circle cx="378" cy="180" r="2" fill="white" />

        {/* Smile */}
        <path d="M344 200 Q359 214 374 200" stroke={DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Floating graduation cap */}
        <motion.g {...floatAnim(0, 12, 4)}>
          <g transform="translate(342, 62)">
            <rect x="8" y="22" width="64" height="8" rx="4" fill="var(--theme-primary)" />
            <polygon points="40,2 72,22 40,40 8,22" fill="var(--theme-primary)" />
            <line x1="72" y1="22" x2="72" y2="44" stroke={STAR} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="72" cy="46" r="5" fill={STAR} />
            <circle cx="40" cy="22" r="6" fill={STAR} opacity="0.85" />
          </g>
        </motion.g>

        {/* Floating star */}
        <motion.g {...floatAnim(0.8, 9, 3.6)}>
          <path d="M58 320 L63 338 L82 338 L68 350 L73 368 L58 356 L43 368 L48 350 L34 338 L53 338Z"
            fill={STAR} opacity="0.8" />
        </motion.g>

        {[{ cx: 290, cy: 430, r: 6 }, { cx: 450, cy: 200, r: 5 }].map(({ cx, cy, r }, i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={r} fill="var(--theme-secondary)" opacity={0.4}
            animate={{ opacity: [0.15, 0.55, 0.15] }}
            transition={{ duration: 2.2 + i * 0.4, repeat: Infinity, delay: i * 0.6 }} />
        ))}
      </svg>
    </motion.div>
  );
}

// ── 4. Person Thinking ────────────────────────────────────────────────────────

function PersonThinking() {
  return (
    <motion.div {...slideIn} className="w-full max-w-lg select-none" aria-hidden>
      <svg viewBox="0 0 500 500" fill="none" className="w-full h-auto">
        {/* Blob */}
        <path d="M248 40 C348 40 435 122 438 226 C441 330 368 424 256 430 C144 436 52 358 48 248 C44 138 118 52 218 42 C228 40 238 40 248 40Z"
          fill="var(--theme-accent)" opacity="0.1" />

        <ellipse cx="252" cy="440" rx="108" ry="16" fill={DARK} opacity="0.07" />

        {/* Large question mark seat */}
        <path d="M210 292 Q198 266 212 248 Q226 228 256 226 Q296 224 310 248 Q326 272 310 296 Q298 312 290 326 Q284 338 284 356 L224 356 Q224 336 218 322 Q212 310 210 292Z"
          fill="var(--theme-primary)" opacity="0.9" />
        <circle cx="254" cy="390" r="22" fill="var(--theme-primary)" opacity="0.9" />

        {/* Person sitting on question mark */}
        {/* Legs hanging down */}
        <path d="M218 354 Q200 390 195 420 Q215 430 228 418 Q238 398 244 368Z" fill={HAIR} />
        <path d="M286 354 Q304 390 305 420 Q285 430 272 418 Q262 398 258 368Z" fill={HAIR} />
        <ellipse cx="192" cy="424" rx="16" ry="10" fill={STAR} />
        <ellipse cx="308" cy="424" rx="16" ry="10" fill={STAR} />

        {/* Body */}
        <path d="M214 252 Q208 310 210 340 Q236 350 256 350 Q276 350 290 340 Q292 310 286 252 Q266 242 252 244 Q232 242 214 252Z"
          fill="var(--theme-secondary)" />

        {/* Right arm — hand on chin (thinking) */}
        <path d="M286 268 Q316 280 328 308 Q316 324 304 318 Q296 298 285 280Z"
          fill="var(--theme-secondary)" />
        <ellipse cx="330" cy="314" rx="16" ry="13" fill={SKIN} />

        {/* Left arm — elbow on knee */}
        <path d="M214 268 Q184 285 174 315 Q186 326 196 320 Q202 302 210 282Z"
          fill="var(--theme-secondary)" />
        <ellipse cx="172" cy="319" rx="14" ry="12" fill={SKIN} />

        {/* Neck */}
        <rect x="238" y="220" width="28" height="32" rx="12" fill={SKIN} />

        {/* Head — tilted slightly */}
        <circle cx="255" cy="186" r="56" fill={SKIN} />

        {/* Hair */}
        <path d="M202 172 Q206 122 255 116 Q304 122 308 172 Q296 136 255 134 Q214 136 202 172Z" fill={HAIR} />

        {/* Eyes — looking up/side (thinking) */}
        <circle cx="237" cy="184" r="7" fill={DARK} />
        <circle cx="274" cy="180" r="7" fill={DARK} />
        <circle cx="240" cy="181" r="2.5" fill="white" />
        <circle cx="277" cy="177" r="2.5" fill="white" />

        {/* Slight smile / pondering */}
        <path d="M240 202 Q255 212 270 204" stroke={DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Floating question marks */}
        <motion.g {...floatAnim(0, 14, 4)}>
          <text x="68" y="190" fontSize="52" fill="var(--theme-primary)" opacity="0.6" fontWeight="900">?</text>
        </motion.g>
        <motion.g {...floatAnim(0.6, 10, 3.5)}>
          <text x="374" y="148" fontSize="38" fill="var(--theme-primary)" opacity="0.4" fontWeight="900">?</text>
        </motion.g>
        <motion.g {...floatAnim(1.2, 8, 4.6)}>
          <text x="396" y="300" fontSize="28" fill="var(--theme-secondary)" opacity="0.5" fontWeight="700">?</text>
        </motion.g>
        <motion.g {...floatAnim(1.8, 11, 3.8)}>
          <text x="84" y="368" fontSize="22" fill="var(--theme-accent)" opacity="0.45" fontWeight="700">?</text>
        </motion.g>

        {/* Lightbulb above head */}
        <motion.g {...floatAnim(0.4, 14, 4.2)}>
          <g transform="translate(290, 64)">
            <circle cx="24" cy="22" r="22" fill={STAR} opacity="0.2" />
            <circle cx="24" cy="22" r="16" fill={STAR} opacity="0.3" />
            <ellipse cx="24" cy="20" rx="12" ry="14" fill={STAR} opacity="0.95" />
            <rect x="18" y="34" width="12" height="5" rx="2" fill="#D97706" />
            <rect x="18" y="39" width="12" height="4" rx="2" fill="#B45309" />
            <path d="M18 20 Q24 14 30 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        </motion.g>

        {/* Leaf decorations */}
        <motion.g {...floatAnim(0.3, 6, 5)}>
          <g transform="translate(60, 256)">
            <path d="M0 40 Q20 0 50 10 Q30 40 0 40Z" fill="#68D391" opacity="0.5" />
            <path d="M0 40 Q30 20 60 30 Q40 50 0 40Z" fill="#48BB78" opacity="0.4" />
          </g>
        </motion.g>
        <motion.g {...floatAnim(1, 7, 4.5)}>
          <g transform="translate(384, 340) scale(-1,1)">
            <path d="M0 40 Q20 0 50 10 Q30 40 0 40Z" fill="#68D391" opacity="0.45" />
            <path d="M0 40 Q30 20 60 30 Q40 50 0 40Z" fill="#48BB78" opacity="0.35" />
          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
}

// ── 5. Person Achievement ─────────────────────────────────────────────────────

function PersonAchievement() {
  return (
    <motion.div {...slideIn} className="w-full max-w-lg select-none" aria-hidden>
      <svg viewBox="0 0 500 500" fill="none" className="w-full h-auto">
        <path d="M252 38 C356 38 442 124 442 232 C442 340 368 432 256 434 C144 436 50 354 48 242 C46 130 122 46 226 40 C235 38 244 38 252 38Z"
          fill={STAR} opacity="0.1" />

        <ellipse cx="252" cy="440" rx="106" ry="16" fill={DARK} opacity="0.07" />

        {/* Trophy */}
        <motion.g {...floatAnim(0, 16, 4)}>
          <g transform="translate(310, 82)">
            {/* Cup */}
            <path d="M24 0 L64 0 L60 48 Q44 60 28 48Z" fill={STAR} />
            <rect x="30" y="48" width="28" height="12" rx="4" fill="#D97706" />
            <rect x="20" y="60" width="48" height="10" rx="5" fill={STAR} />
            {/* Handles */}
            <path d="M24 8 Q8 8 8 24 Q8 40 24 40" stroke={STAR} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M64 8 Q80 8 80 24 Q80 40 64 40" stroke={STAR} strokeWidth="6" fill="none" strokeLinecap="round" />
            {/* Star on cup */}
            <path d="M44 10 L47 20 L58 20 L49 27 L52 37 L44 30 L36 37 L39 27 L30 20 L41 20Z"
              fill="white" opacity="0.85" />
          </g>
        </motion.g>

        {/* Legs jumping */}
        <path d="M210 360 Q195 400 185 430 Q204 440 218 428 Q228 408 236 382Z" fill={HAIR} />
        <path d="M294 360 Q310 400 318 430 Q298 440 284 428 Q274 408 266 382Z" fill={HAIR} />
        <ellipse cx="183" cy="433" rx="18" ry="10" fill="var(--theme-primary)" opacity="0.9" />
        <ellipse cx="320" cy="433" rx="18" ry="10" fill="var(--theme-primary)" opacity="0.9" />

        {/* Body */}
        <path d="M208 240 Q200 310 204 352 Q230 362 252 362 Q274 362 296 352 Q300 310 292 240 Q270 228 252 232 Q230 228 208 240Z"
          fill="var(--theme-primary)" />

        {/* Both arms raised high */}
        <path d="M210 250 Q185 220 172 190 Q162 174 172 164 Q182 156 194 170 Q212 196 218 232Z"
          fill="var(--theme-primary)" />
        <ellipse cx="168" cy="162" rx="16" ry="13" fill={SKIN} transform="rotate(-30 168 162)" />

        <path d="M292 250 Q316 218 328 188 Q336 172 326 162 Q316 154 304 168 Q288 194 284 232Z"
          fill="var(--theme-primary)" />
        <ellipse cx="330" cy="160" rx="16" ry="13" fill={SKIN} transform="rotate(30 330 160)" />

        {/* Neck */}
        <rect x="236" y="208" width="28" height="32" rx="12" fill={SKIN} />

        {/* Head */}
        <circle cx="250" cy="174" r="56" fill={SKIN} />

        {/* Hair */}
        <path d="M197 160 Q200 110 250 104 Q300 110 303 160 Q292 124 250 122 Q208 124 197 160Z" fill={HAIR} />

        {/* Big joyful eyes */}
        <path d="M226 176 Q232 162 240 176" stroke={DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M260 176 Q266 162 274 176" stroke={DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Wide smile */}
        <path d="M224 196 Q250 220 276 196" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M230 196 Q250 208 270 196 Q250 218 230 196Z" fill={SKIN} opacity="0.3" />

        {/* Confetti / stars */}
        {[
          { x: 72, y: 108, r: 10, c: STAR, shape: "star" },
          { x: 410, y: 210, r: 8, c: "var(--theme-secondary)", shape: "circle" },
          { x: 88, y: 310, r: 7, c: "var(--theme-accent)", shape: "circle" },
          { x: 90, y: 180, r: 6, c: "var(--theme-primary)", shape: "circle" },
        ].map(({ x, y, r, c, shape }, i) => (
          shape === "star"
            ? <motion.path key={i}
                d={`M${x} ${y - r} L${x + r * 0.38} ${y - r * 0.28} L${x + r} ${y - r * 0.28} L${x + r * 0.6} ${y + r * 0.12} L${x + r * 0.72} ${y + r} L${x} ${y + r * 0.56} L${x - r * 0.72} ${y + r} L${x - r * 0.6} ${y + r * 0.12} L${x - r} ${y - r * 0.28} L${x - r * 0.38} ${y - r * 0.28}Z`}
                fill={c}
                animate={{ opacity: [0.4, 1, 0.4], rotate: [0, 20, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }} />
            : <motion.circle key={i} cx={x} cy={y} r={r} fill={c}
                animate={{ opacity: [0.25, 0.7, 0.25], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 2.2 + i * 0.4, repeat: Infinity, delay: i * 0.4 }} />
        ))}

        {/* Certificate scroll */}
        <motion.g {...floatAnim(1, 10, 4.5)}>
          <g transform="translate(64, 208) rotate(-12)">
            <rect x="0" y="0" width="56" height="44" rx="6" fill="white" stroke="var(--theme-primary)" strokeWidth="1.5" />
            <rect x="4" y="10" width="48" height="3" rx="1.5" fill="var(--theme-primary)" opacity="0.5" />
            <rect x="4" y="18" width="36" height="3" rx="1.5" fill="var(--theme-primary)" opacity="0.3" />
            <rect x="4" y="26" width="42" height="3" rx="1.5" fill="var(--theme-primary)" opacity="0.3" />
            <circle cx="28" cy="38" r="5" fill={STAR} />
          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
}

// ── 6. Person Team ────────────────────────────────────────────────────────────

function PersonTeam() {
  return (
    <motion.div {...slideIn} className="w-full max-w-lg select-none" aria-hidden>
      <svg viewBox="0 0 500 500" fill="none" className="w-full h-auto">
        <path d="M250 40 C352 40 438 124 440 230 C442 336 370 428 258 432 C146 436 52 356 48 246 C44 136 120 50 222 42 C232 40 241 40 250 40Z"
          fill="var(--theme-primary)" opacity="0.1" />

        <ellipse cx="250" cy="442" rx="180" ry="18" fill={DARK} opacity="0.07" />

        {/* Person 1 — Left */}
        <rect x="66" y="330" width="22" height="100" rx="11" fill={HAIR} />
        <rect x="96" y="330" width="22" height="100" rx="11" fill={HAIR} />
        <ellipse cx="77" cy="432" rx="15" ry="9" fill="var(--theme-secondary)" />
        <ellipse cx="107" cy="432" rx="15" ry="9" fill="var(--theme-secondary)" />
        <rect x="58" y="238" width="84" height="96" rx="28" fill="var(--theme-secondary)" />
        {/* P1 arm towards center */}
        <path d="M138 270 Q164 282 182 300 Q170 316 158 310 Q148 296 136 284Z" fill="var(--theme-secondary)" />
        <ellipse cx="184" cy="306" rx="13" ry="11" fill={SKIN} />
        {/* P1 left arm */}
        <path d="M62 270 Q40 290 32 318 Q42 328 52 322 Q56 302 66 284Z" fill="var(--theme-secondary)" />
        <ellipse cx="30" cy="322" rx="13" ry="11" fill={SKIN} />
        <rect x="84" y="207" width="28" height="34" rx="12" fill={SKIN} />
        <circle cx="98" cy="172" r="48" fill={SKIN} />
        <path d="M53 160 Q56 116 98 110 Q140 116 143 160 Q132 128 98 126 Q64 128 53 160Z" fill={HAIR} />
        <circle cx="84" cy="172" r="5.5" fill={DARK} />
        <circle cx="112" cy="172" r="5.5" fill={DARK} />
        <circle cx="86" cy="170" r="2" fill="white" />
        <circle cx="114" cy="170" r="2" fill="white" />
        <path d="M84 188 Q98 200 112 188" stroke={DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Person 2 — Center (slightly in front / taller) */}
        <rect x="218" y="322" width="24" height="110" rx="12" fill={HAIR} />
        <rect x="252" y="322" width="24" height="110" rx="12" fill={HAIR} />
        <ellipse cx="230" cy="434" rx="17" ry="10" fill="var(--theme-primary)" />
        <ellipse cx="264" cy="434" rx="17" ry="10" fill="var(--theme-primary)" />
        <rect x="205" y="220" width="92" height="108" rx="32" fill="var(--theme-primary)" />
        {/* P2 left arm (handshake with P1) */}
        <path d="M208 248 Q176 266 168 290 Q180 308 192 302 Q200 278 214 260Z" fill="var(--theme-primary)" />
        <ellipse cx="166" cy="296" rx="14" ry="12" fill={SKIN} />
        {/* P2 right arm (handshake with P3) */}
        <path d="M294 248 Q326 266 334 290 Q322 308 310 302 Q302 278 288 260Z" fill="var(--theme-primary)" />
        <ellipse cx="336" cy="296" rx="14" ry="12" fill={SKIN} />
        <rect x="238" y="188" width="28" height="34" rx="12" fill={SKIN} />
        <circle cx="252" cy="152" r="52" fill={SKIN} />
        <path d="M203 138 Q206 90 252 84 Q298 90 301 138 Q288 106 252 104 Q216 106 203 138Z" fill={HAIR} />
        <circle cx="236" cy="152" r="6" fill={DARK} />
        <circle cx="268" cy="152" r="6" fill={DARK} />
        <circle cx="238" cy="149" r="2" fill="white" />
        <circle cx="270" cy="149" r="2" fill="white" />
        <path d="M238 172 Q252 186 266 172" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Person 3 — Right */}
        <rect x="356" y="330" width="22" height="100" rx="11" fill={HAIR} />
        <rect x="388" y="330" width="22" height="100" rx="11" fill={HAIR} />
        <ellipse cx="367" cy="432" rx="15" ry="9" fill="var(--theme-accent)" />
        <ellipse cx="399" cy="432" rx="15" ry="9" fill="var(--theme-accent)" />
        <rect x="352" y="238" width="84" height="96" rx="28" fill="var(--theme-accent)" />
        {/* P3 arm towards center */}
        <path d="M356 270 Q328 284 312 300 Q322 318 334 310 Q344 294 358 282Z" fill="var(--theme-accent)" />
        <ellipse cx="310" cy="306" rx="13" ry="11" fill={SKIN} />
        {/* P3 right arm */}
        <path d="M432 270 Q452 288 462 316 Q452 328 442 322 Q438 304 426 286Z" fill="var(--theme-accent)" />
        <ellipse cx="464" cy="320" rx="13" ry="11" fill={SKIN} />
        <rect x="382" y="207" width="28" height="34" rx="12" fill={SKIN} />
        <circle cx="396" cy="172" r="48" fill={SKIN} />
        <path d="M351 160 Q354 116 396 110 Q438 116 441 160 Q430 128 396 126 Q362 128 351 160Z" fill={HAIR} />
        <circle cx="382" cy="172" r="5.5" fill={DARK} />
        <circle cx="410" cy="172" r="5.5" fill={DARK} />
        <circle cx="384" cy="170" r="2" fill="white" />
        <circle cx="412" cy="170" r="2" fill="white" />
        <path d="M382 188 Q396 200 410 188" stroke={DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Chat bubbles */}
        <motion.g {...floatAnim(0, 10, 4)}>
          <g transform="translate(60, 78)">
            <rect x="0" y="0" width="68" height="36" rx="14" fill="var(--theme-secondary)" opacity="0.85" />
            <polygon points="12,36 24,36 18,48" fill="var(--theme-secondary)" opacity="0.85" />
            <circle cx="18" cy="18" r="5" fill="white" opacity="0.8" />
            <circle cx="34" cy="18" r="5" fill="white" opacity="0.8" />
            <circle cx="50" cy="18" r="5" fill="white" opacity="0.8" />
          </g>
        </motion.g>

        <motion.g {...floatAnim(0.9, 11, 3.7)}>
          <g transform="translate(358, 64)">
            <rect x="0" y="0" width="68" height="36" rx="14" fill="var(--theme-primary)" opacity="0.85" />
            <polygon points="56,36 68,36 62,48" fill="var(--theme-primary)" opacity="0.85" />
            <circle cx="18" cy="18" r="5" fill="white" opacity="0.8" />
            <circle cx="34" cy="18" r="5" fill="white" opacity="0.8" />
            <circle cx="50" cy="18" r="5" fill="white" opacity="0.8" />
          </g>
        </motion.g>

        <motion.g {...floatAnim(0.5, 8, 4.5)}>
          <g transform="translate(200, 54)">
            <path d="M22 0 L27 14 L42 14 L30 23 L35 37 L22 28 L9 37 L14 23 L2 14 L17 14Z" fill={STAR} opacity="0.9" />
          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
