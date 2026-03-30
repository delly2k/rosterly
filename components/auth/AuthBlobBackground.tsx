/**
 * Shared neo-brutalist blob background (matches login page).
 * Decorative only; use inside a relative min-h-screen overflow-hidden wrapper.
 */
export function AuthBlobBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Top-left blob - Hot Pink */}
      <svg
        className="absolute -left-[20%] -top-[15%] h-[50vmax] w-[50vmax] sm:-left-[10%] sm:-top-[10%] sm:h-[55vmax] sm:w-[55vmax]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      >
        <path
          fill="#EC4899"
          d="M45,35 C80,20 120,40 130,80 C145,130 100,160 55,150 C15,140 -10,90 15,55 C35,25 25,45 45,35 Z"
        />
      </svg>
      {/* Bottom-left blob - Electric Teal */}
      <svg
        className="absolute -bottom-[25%] -left-[15%] h-[45vmax] w-[45vmax] sm:-bottom-[20%] sm:-left-[10%] sm:h-[50vmax] sm:w-[50vmax]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      >
        <path
          fill="#06B6D4"
          d="M30,120 C50,80 90,60 130,90 C170,120 180,165 140,190 C95,210 40,185 25,145 C10,115 15,140 30,120 Z"
        />
      </svg>
      {/* Right side - Vibrant Yellow */}
      <svg
        className="absolute -right-[25%] top-1/2 h-[70vmax] w-[70vmax] -translate-y-1/2 sm:-right-[18%] sm:h-[75vmax] sm:w-[75vmax]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      >
        <path
          fill="#FDE047"
          d="M120,30 C165,50 190,95 175,140 C160,185 110,200 70,185 C30,170 10,120 35,75 C55,40 85,15 120,30 Z"
        />
      </svg>
      {/* Smaller accent - Royal Blue (top right area) */}
      <svg
        className="absolute -right-[5%] -top-[10%] h-[28vmax] w-[28vmax] sm:h-[32vmax] sm:w-[32vmax]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      >
        <path
          fill="#1D4ED8"
          d="M150,40 C180,60 190,100 170,135 C150,170 110,180 75,160 C45,142 40,100 65,65 C85,40 125,25 150,40 Z"
        />
      </svg>
      {/* Accent - Bright Orange (bottom right) */}
      <svg
        className="absolute -bottom-[15%] -right-[10%] h-[25vmax] w-[25vmax] sm:-bottom-[12%] sm:-right-[8%] sm:h-[28vmax] sm:w-[28vmax]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      >
        <path
          fill="#F97316"
          d="M140,130 C165,150 170,190 140,200 C105,212 65,190 55,150 C45,115 75,85 110,95 C130,102 120,115 140,130 Z"
        />
      </svg>
    </div>
  );
}
