'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Handcrafted, botanical hero honey jar.
 * Features an engineered cap that fits snugly onto the glass neck lip,
 * realistic glass highlights, multi-layered warm amber honey with meniscus curve,
 * a tamper-evident NFC wax seal ribbon, and an artisan letterpress label.
 */
export default function HoneyDropScene() {
  const reduceMotion = useReducedMotion();
  const gentleFloat = reduceMotion ? {} : { y: [0, -10, 0], rotate: [-0.8, 0.8, -0.8] };

  return (
    <div className="drop-scene" aria-label="Handcrafted HoneyChain bottle passport">
      <svg viewBox="0 0 560 620" role="img" aria-labelledby="drop-scene-title" className="drop-scene__svg">
        <title id="drop-scene-title">A traced jar of wildflower honey travelling from hive to home</title>
        <defs>
          {/* Honey Liquid Gradients */}
          <linearGradient id="honey-fluid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd863" />
            <stop offset="35%" stopColor="#f0a51d" />
            <stop offset="75%" stopColor="#cf720a" />
            <stop offset="100%" stopColor="#873703" />
          </linearGradient>

          <linearGradient id="honey-highlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff3b3" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffc938" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f39c12" stopOpacity="0.6" />
          </linearGradient>

          {/* Glass Translucency */}
          <linearGradient id="glass-specular" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.28" />
          </linearGradient>

          {/* Cap Metallic Gradients */}
          <linearGradient id="cap-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a2b1f" />
            <stop offset="25%" stopColor="#2c4233" />
            <stop offset="50%" stopColor="#3d5745" />
            <stop offset="75%" stopColor="#2c4233" />
            <stop offset="100%" stopColor="#18271d" />
          </linearGradient>

          <linearGradient id="cap-gold-rim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c29124" />
            <stop offset="35%" stopColor="#f7d674" />
            <stop offset="65%" stopColor="#ffd966" />
            <stop offset="100%" stopColor="#ab7b16" />
          </linearGradient>

          <linearGradient id="wax-seal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e59e2b" />
            <stop offset="100%" stopColor="#9e5606" />
          </linearGradient>

          {/* Soft Ground Shadow */}
          <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="12" />
            <feOffset dx="0" dy="16" result="offset" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.22" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Inner Jar Honey Clipping Path */}
          <clipPath id="inner-jar-clip">
            <path d="
              M 188 200
              L 188 232
              C 188 250 162 268 162 292
              L 162 470
              C 162 506 195 530 280 530
              C 365 530 398 506 398 470
              L 398 292
              C 398 268 372 250 372 232
              L 372 200
              Z
            " />
          </clipPath>
        </defs>

        {/* Ambient Flight Route Trails */}
        <g className="drop-scene__route" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 8" opacity="0.45">
          <path d="M 52 110 C 110 50 135 120 185 85 C 235 50 250 -10 320 15 C 380 40 370 100 440 115 C 485 125 510 90 530 65" />
          <path d="M 65 480 C 125 450 165 505 220 470 C 275 435 285 365 355 370 C 415 375 440 430 495 395" />
        </g>

        {/* Honeybee 1 (Top Left) */}
        <g transform="translate(68, 85)" fill="#f6d168" stroke="#1c2b22" strokeWidth="1.5">
          <path d="M 12 18 C 24 10 36 14 44 26 C 30 30 18 28 12 18 Z" />
          <path d="M 21 11 C 18 0 26 -7 36 -10 C 33 2 30 11 21 11 Z" />
          <circle cx="6" cy="24" r="5" fill="#1c2b22" />
        </g>

        {/* Honeybee 2 (Bottom Right) */}
        <g transform="translate(470, 420)" fill="#f6d168" stroke="#1c2b22" strokeWidth="1.5">
          <path d="M 12 18 C 24 10 36 14 44 26 C 30 30 18 28 12 18 Z" />
          <path d="M 21 11 C 18 0 26 -7 36 -10 C 33 2 30 11 21 11 Z" />
          <circle cx="6" cy="24" r="5" fill="#1c2b22" />
        </g>

        {/* Floating Bottle Assembly */}
        <motion.g
          animate={gentleFloat}
          transition={{ duration: 6.5, ease: 'easeInOut', repeat: Infinity }}
          filter="url(#soft-shadow)"
        >
          {/* Ground Contact Shadow */}
          <ellipse cx="280" cy="542" rx="124" ry="16" fill="#1c2b22" opacity="0.14" />

          {/* 1. GLASS JAR SILHOUETTE (Base body) */}
          <path
            d="
              M 184 195
              L 184 230
              C 184 252 158 270 158 296
              L 158 472
              C 158 514 198 535 280 535
              C 362 535 402 514 402 472
              L 402 296
              C 402 270 376 252 376 230
              L 376 195
              Z
            "
            fill="url(#glass-specular)"
            stroke="#1c2b22"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Glass Neck Bead / Thread Ring below cap */}
          <path
            d="M 180 198 C 180 198 220 203 280 203 C 340 203 380 198 380 198"
            stroke="#1c2b22"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
          />

          {/* 2. LIQUID HONEY LAYER (Clipped inside jar) */}
          <g clipPath="url(#inner-jar-clip)">
            {/* Liquid Fill */}
            <path
              d="
                M 150 336
                C 190 326 230 350 280 340
                C 330 330 365 352 410 338
                L 410 545
                L 150 545
                Z
              "
              fill="url(#honey-fluid)"
            />

            {/* Honey Meniscus Surface Curve */}
            <path
              d="
                M 158 336
                C 200 324 240 348 280 340
                C 320 332 360 350 402 338
              "
              fill="none"
              stroke="url(#honey-highlight)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />

            {/* Internal Viscosity Flow Highlights */}
            <path
              d="M 175 390 C 220 380 250 405 295 395"
              fill="none"
              stroke="#ffd966"
              strokeWidth="2.5"
              opacity="0.65"
              strokeLinecap="round"
            />
            <path
              d="M 270 440 C 310 430 345 448 385 435"
              fill="none"
              stroke="#ffd966"
              strokeWidth="2.2"
              opacity="0.55"
              strokeLinecap="round"
            />

            {/* Rising Golden Micro-bubbles */}
            <circle cx="210" cy="460" r="2.8" fill="#fff" opacity="0.45" />
            <circle cx="218" cy="420" r="1.8" fill="#fff" opacity="0.4" />
            <circle cx="340" cy="480" r="2.5" fill="#fff" opacity="0.45" />
            <circle cx="355" cy="435" r="3.2" fill="#fff" opacity="0.4" />
            <circle cx="282" cy="495" r="2" fill="#fff" opacity="0.35" />
          </g>

          {/* 3. GLASS SPECULAR LIGHT REFLECTIONS (Realistic 3D Sheen) */}
          {/* Left Primary Highlight Tube */}
          <path
            d="M 172 278 C 168 310 166 360 166 430 C 166 465 170 490 178 505"
            fill="none"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.42"
          />
          {/* Left Soft Thin Sheen */}
          <path
            d="M 183 290 L 183 480"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Right Subtle Rim Glint */}
          <path
            d="M 390 285 C 393 320 393 370 393 440"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* 4. TAMPER-EVIDENT WAX & NFC SECURITY RIBBON */}
          {/* Ribbon draped over the neck under the cap down onto the shoulder */}
          <g>
            <path
              d="
                M 218 184
                L 218 245
                C 218 255 224 262 232 265
                L 236 266
                C 244 268 250 262 250 252
                L 250 184
                Z
              "
              fill="url(#wax-seal)"
              stroke="#1c2b22"
              strokeWidth="1.2"
            />
            {/* Wax Seal Medallion with NFC Icon */}
            <circle cx="234" cy="256" r="11" fill="#a76608" stroke="#1c2b22" strokeWidth="1.5" />
            <path
              d="M 230 251 C 234 249 237 251 238 253 M 229 255 C 234 253 238 255 240 258"
              fill="none"
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="231" cy="259" r="1.2" fill="#fff" />
          </g>

          {/* 5. PERFECTLY FITTED METALLIC JAR CAP */}
          {/* Center X: 280. Neck lip is width 192 (from 184 to 376).
              Cap width is 206 (from 177 to 383), extending 7px over the neck edge on each side.
              Height: 46px (from y=148 to y=194). Snug, flush, proportional! */}
          <g id="fitted-jar-cap">
            {/* Cap Base Bevel Collar */}
            <rect
              x="177"
              y="182"
              width="206"
              height="12"
              rx="4"
              fill="url(#cap-gold-rim)"
              stroke="#1c2b22"
              strokeWidth="2.5"
            />

            {/* Main Cap Body (Deep Hunter Green & Textured Metallic) */}
            <rect
              x="179"
              y="148"
              width="202"
              height="36"
              rx="7"
              fill="url(#cap-body)"
              stroke="#1c2b22"
              strokeWidth="2.5"
            />

            {/* Precision Grip Knurling Ribs */}
            <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5">
              <line x1="195" y1="151" x2="195" y2="181" />
              <line x1="205" y1="151" x2="205" y2="181" />
              <line x1="215" y1="151" x2="215" y2="181" />
              <line x1="345" y1="151" x2="345" y2="181" />
              <line x1="355" y1="151" x2="355" y2="181" />
              <line x1="365" y1="151" x2="365" y2="181" />
            </g>

            {/* Gold Leaf Accent Inlay Stripes */}
            <line x1="184" y1="157" x2="376" y2="157" stroke="url(#cap-gold-rim)" strokeWidth="3" />
            <line x1="184" y1="173" x2="376" y2="173" stroke="url(#cap-gold-rim)" strokeWidth="2" opacity="0.85" />

            {/* Cap Top Specular Highlight */}
            <path
              d="M 188 151 C 220 149 340 149 372 151"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.45"
            />

            {/* Embossed Hexagonal HoneyChain Seal on Cap Center */}
            <polygon
              points="280,158 288,162.5 288,171.5 280,176 272,171.5 272,162.5"
              fill="#c29124"
              stroke="#1c2b22"
              strokeWidth="1.2"
            />
            <circle cx="280" cy="167" r="2.2" fill="#1c2b22" />
          </g>

          {/* 6. ARTISAN LETTERPRESS LABEL */}
          {/* Centered at X: 280, Y: 300 to 424 */}
          <g id="artisan-label">
            {/* Paper Label Drop Shadow */}
            <rect x="195" y="303" width="170" height="124" rx="5" fill="#1c2b22" opacity="0.12" />

            {/* Warm Textured Paper Face */}
            <rect
              x="193"
              y="300"
              width="174"
              height="124"
              rx="5"
              fill="#fbf7ec"
              stroke="#1c2b22"
              strokeWidth="2.2"
            />

            {/* Double Border Framing in Gold Foil & Fine Ink */}
            <rect
              x="199"
              y="306"
              width="162"
              height="112"
              rx="3"
              fill="none"
              stroke="#d4a338"
              strokeWidth="1.3"
            />
            <rect
              x="202"
              y="309"
              width="156"
              height="106"
              rx="2"
              fill="none"
              stroke="#1c2b22"
              strokeWidth="0.8"
              opacity="0.3"
            />

            {/* Botanical Compass Star Emblem */}
            <g transform="translate(273, 316)" fill="none" stroke="#1c2b22" strokeWidth="1.3">
              <path d="M 7 0 L 14 7 L 7 14 L 0 7 Z" fill="#fbf7ec" />
              <path d="M 7 0 L 7 14 M 0 7 L 14 7" />
              <circle cx="7" cy="7" r="1.6" fill="#a76608" />
            </g>

            {/* Typography */}
            <text
              x="280"
              y="350"
              textAnchor="middle"
              fontFamily="Cormorant Garamond, Georgia, serif"
              fontSize="17"
              fontWeight="700"
              letterSpacing="1.2"
              fill="#1c2b22"
            >
              WILDFLOWER
            </text>

            <text
              x="280"
              y="368"
              textAnchor="middle"
              fontFamily="ui-monospace, JetBrains Mono, monospace"
              fontSize="7.5"
              fontWeight="600"
              letterSpacing="2.2"
              fill="#3f5840"
            >
              HARVEST PASSPORT · EVM
            </text>

            <line x1="216" y1="376" x2="344" y2="376" stroke="#ded9cc" strokeWidth="1" />

            <text
              x="280"
              y="392"
              textAnchor="middle"
              fontFamily="ui-monospace, JetBrains Mono, monospace"
              fontSize="9"
              fontWeight="700"
              letterSpacing="1.1"
              fill="#a76608"
            >
              LOT 26 · 08 · KASHMIR
            </text>

            <text
              x="280"
              y="406"
              textAnchor="middle"
              fontFamily="ui-monospace, JetBrains Mono, monospace"
              fontSize="7"
              letterSpacing="0.8"
              fill="#697469"
            >
              31.6° N · 77.2° E · SEALED 06:45
            </text>
          </g>
        </motion.g>

        {/* 7. SATELLITE ANNOTATION CARDS */}
        <g className="drop-scene__label" fill="#1c2b22">
          {/* Left Origin Pointer */}
          <circle cx="144" cy="276" r="4.5" fill="#e5a52d" stroke="#1c2b22" strokeWidth="1.5" />
          <path d="M 44 276 H 138" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 3" opacity="0.6" />
          <text x="134" y="262" textAnchor="end" fontFamily="ui-monospace, JetBrains Mono, monospace" fontSize="8.5" fontWeight="600" letterSpacing="1.2" fill="#3f5840">
            HIVE / ORIGIN
          </text>
          <text x="134" y="292" textAnchor="end" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="14" fontWeight="700" fill="currentColor">
            31.6° N · 77.2° E
          </text>

          {/* Right NFC Security Pointer */}
          <circle cx="416" cy="284" r="4.5" fill="#e5a52d" stroke="#1c2b22" strokeWidth="1.5" />
          <path d="M 422 284 H 516" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 3" opacity="0.6" />
          <text x="426" y="270" textAnchor="start" fontFamily="ui-monospace, JetBrains Mono, monospace" fontSize="8.5" fontWeight="600" letterSpacing="1.2" fill="#3f5840">
            SEALED / 06:45
          </text>
          <text x="426" y="300" textAnchor="start" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="14" fontWeight="700" fill="currentColor">
            WAX + NFC NTAG 424
          </text>
        </g>
      </svg>
    </div>
  );
}
