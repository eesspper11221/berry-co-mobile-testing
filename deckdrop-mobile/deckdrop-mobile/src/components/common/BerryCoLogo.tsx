import React from 'react';

interface BerryCoLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const BerryCoLogo: React.FC<BerryCoLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-xs select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="berryBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9BB587" />
            <stop offset="100%" stopColor="#7E996B" />
          </radialGradient>
          <linearGradient id="berryRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E23B2E" />
            <stop offset="50%" stopColor="#C0221E" />
            <stop offset="100%" stopColor="#8A1110" />
          </linearGradient>
          <radialGradient id="drupeletGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF6B5E" />
            <stop offset="35%" stopColor="#D82823" />
            <stop offset="85%" stopColor="#961210" />
            <stop offset="100%" stopColor="#5E0908" />
          </radialGradient>
          <radialGradient id="highlightDrupe" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#FFA69E" />
            <stop offset="50%" stopColor="#E63935" />
            <stop offset="100%" stopColor="#A81512" />
          </radialGradient>

          {/* Text Paths for Top and Bottom Arcs */}
          {/* Top Arc (Clockwise for readable top text) */}
          <path
            id="topArcPath"
            d="M 85,250 A 165,165 0 0,1 415,250"
            fill="none"
          />
          {/* Bottom Arc (Clockwise for readable bottom text) */}
          <path
            id="bottomArcPath"
            d="M 425,250 A 175,175 0 0,1 75,250"
            fill="none"
          />
        </defs>

        {/* Outer Red Ring */}
        <circle cx="250" cy="250" r="240" fill="#B3201F" stroke="#8E1413" strokeWidth="3" />

        {/* Cream / Vanilla Middle Ring */}
        <circle cx="250" cy="250" r="222" fill="#FAF1D9" />
        <circle cx="250" cy="250" r="222" fill="none" stroke="#B3201F" strokeWidth="2.5" />

        {/* Top Text: COLLECT. TRADE. PLAY. */}
        <text
          fill="#A81B1A"
          fontSize="31"
          fontWeight="900"
          fontFamily="'Plus Jakarta Sans', 'Arial Black', Impact, sans-serif"
          letterSpacing="4.5"
        >
          <textPath href="#topArcPath" startOffset="50%" textAnchor="middle">
            COLLECT. TRADE. PLAY.
          </textPath>
        </text>

        {/* Bottom Text: HOBBY & TCG CARD GAME STORE */}
        <text
          fill="#A81B1A"
          fontSize="24.5"
          fontWeight="900"
          fontFamily="'Plus Jakarta Sans', 'Arial Black', Impact, sans-serif"
          letterSpacing="3"
        >
          <textPath href="#bottomArcPath" startOffset="50%" textAnchor="middle">
            HOBBY &amp; TCG CARD GAME STORE
          </textPath>
        </text>

        {/* Inner Red Border */}
        <circle cx="250" cy="250" r="162" fill="none" stroke="#B3201F" strokeWidth="6" />

        {/* Center Sage Green Disc */}
        <circle cx="250" cy="250" r="158" fill="url(#berryBgGrad)" />

        {/* Script Brand: BerryCo. */}
        <g transform="translate(250, 148)">
          {/* Shadow */}
          <text
            x="2"
            y="2"
            textAnchor="middle"
            fill="#536B42"
            fontSize="44"
            fontStyle="italic"
            fontWeight="900"
            fontFamily="'Brush Script MT', 'Playfair Display', cursive, serif"
            letterSpacing="-0.5"
          >
            BerryCo.
          </text>
          {/* Cream Outline */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#FAF1D9"
            stroke="#FAF1D9"
            strokeWidth="5"
            fontSize="44"
            fontStyle="italic"
            fontWeight="900"
            fontFamily="'Brush Script MT', 'Playfair Display', cursive, serif"
            letterSpacing="-0.5"
          >
            BerryCo.
          </text>
          {/* Red Text */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#B3201F"
            fontSize="44"
            fontStyle="italic"
            fontWeight="900"
            fontFamily="'Brush Script MT', 'Playfair Display', cursive, serif"
            letterSpacing="-0.5"
          >
            BerryCo.
          </text>
        </g>

        {/* Stem (Twig at top right of the raspberry) */}
        <g id="berryStem" transform="translate(250, 240)">
          {/* Main Curved Stem */}
          <path
            d="M 22,-58 C 30,-80 50,-95 82,-98 C 76,-90 68,-78 52,-68 C 42,-60 32,-56 22,-58 Z"
            fill="#5E5028"
            stroke="#3B3215"
            strokeWidth="1.5"
          />
          {/* Calyx Leaves */}
          <path
            d="M 12,-52 C 2,-62 -8,-68 -22,-66 C -14,-58 -4,-52 8,-48 Z"
            fill="#4F6830"
          />
          <path
            d="M 28,-50 C 42,-55 56,-52 64,-44 C 52,-44 38,-44 26,-46 Z"
            fill="#435828"
          />
          <path
            d="M 18,-54 C 22,-68 28,-76 34,-80 C 30,-70 26,-60 20,-52 Z"
            fill="#6E7B34"
          />
        </g>

        {/* Center Raspberry Fruit */}
        <g id="raspberryBody" transform="translate(250, 290)">
          {/* Drop shadow underneath the berry */}
          <ellipse cx="0" cy="85" rx="72" ry="18" fill="#3D4F2E" opacity="0.35" />

          {/* Berry Base Silhouette */}
          <path
            d="M -68,-50 C -82,0 -78,55 -35,82 C -15,92 15,92 35,82 C 78,55 82,0 68,-50 C 50,-80 -50,-80 -68,-50 Z"
            fill="#750E0C"
          />

          {/* Tier 1: Drupelets (Top Row) */}
          <circle cx="-42" cy="-60" r="16" fill="url(#drupeletGrad)" />
          <circle cx="-16" cy="-68" r="17" fill="url(#drupeletGrad)" />
          <circle cx="14" cy="-68" r="17" fill="url(#drupeletGrad)" />
          <circle cx="42" cy="-60" r="16" fill="url(#drupeletGrad)" />

          {/* Tier 2: Drupelets (Upper Middle) */}
          <circle cx="-56" cy="-35" r="18" fill="url(#drupeletGrad)" />
          <circle cx="-28" cy="-42" r="19" fill="url(#highlightDrupe)" />
          <circle cx="0" cy="-45" r="20" fill="url(#highlightDrupe)" />
          <circle cx="28" cy="-42" r="19" fill="url(#highlightDrupe)" />
          <circle cx="56" cy="-35" r="18" fill="url(#drupeletGrad)" />

          {/* Tier 3: Drupelets (Center Wide) */}
          <circle cx="-65" cy="-8" r="19" fill="url(#drupeletGrad)" />
          <circle cx="-38" cy="-14" r="21" fill="url(#highlightDrupe)" />
          <circle cx="-10" cy="-16" r="22" fill="url(#highlightDrupe)" />
          <circle cx="18" cy="-15" r="21" fill="url(#highlightDrupe)" />
          <circle cx="48" cy="-10" r="20" fill="url(#drupeletGrad)" />
          <circle cx="68" cy="-5" r="17" fill="url(#drupeletGrad)" />

          {/* Tier 4: Drupelets (Lower Middle) */}
          <circle cx="-58" cy="20" r="18" fill="url(#drupeletGrad)" />
          <circle cx="-32" cy="16" r="20" fill="url(#highlightDrupe)" />
          <circle cx="-3" cy="14" r="21" fill="url(#highlightDrupe)" />
          <circle cx="26" cy="15" r="20" fill="url(#highlightDrupe)" />
          <circle cx="54" cy="18" r="18" fill="url(#drupeletGrad)" />

          {/* Tier 5: Drupelets (Lower) */}
          <circle cx="-45" cy="45" r="17" fill="url(#drupeletGrad)" />
          <circle cx="-20" cy="44" r="19" fill="url(#highlightDrupe)" />
          <circle cx="8" cy="43" r="19" fill="url(#highlightDrupe)" />
          <circle cx="36" cy="44" r="17" fill="url(#drupeletGrad)" />

          {/* Tier 6: Drupelets (Bottom Tip) */}
          <circle cx="-26" cy="68" r="15" fill="url(#drupeletGrad)" />
          <circle cx="-3" cy="70" r="16" fill="url(#drupeletGrad)" />
          <circle cx="20" cy="68" r="15" fill="url(#drupeletGrad)" />
          <circle cx="-2" cy="84" r="13" fill="url(#drupeletGrad)" />

          {/* Highlights & Texture Spots */}
          <ellipse cx="-8" cy="-20" rx="6" ry="4" fill="#FFC8C4" opacity="0.65" />
          <ellipse cx="14" cy="-18" rx="5" ry="3.5" fill="#FFC8C4" opacity="0.6" />
          <ellipse cx="-25" cy="-45" rx="5" ry="3.5" fill="#FFC8C4" opacity="0.6" />
          <ellipse cx="24" cy="-44" rx="5" ry="3" fill="#FFC8C4" opacity="0.55" />
          <ellipse cx="-5" cy="10" rx="6" ry="4" fill="#FFC8C4" opacity="0.6" />
          <ellipse cx="-18" cy="40" rx="5" ry="3" fill="#FFC8C4" opacity="0.5" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-black tracking-tight text-[#E23B2E]">
            Berry Co.
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#35322E]/60">
            Hobby &amp; TCG Store
          </span>
        </div>
      )}
    </div>
  );
};
