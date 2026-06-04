interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded square background with brand gradient */}
        <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />

        {/* Ghost body */}
        <path
          d="M20 8c-5.5 0-10 4.2-10 9.5v12c0 .8.5 1.3 1 1 .6-.3 1.2-.3 1.8 0 .8.4 1.6.4 2.4 0 .8-.4 1.6-.4 2.4 0 .8.4 1.6.4 2.4 0 .8-.4 1.6-.4 2.4 0 .8.4 1.6.4 2.4 0 .6-.3 1.2-.3 1.8 0 .5.3 1-.2 1-1v-12C30 12.2 25.5 8 20 8z"
          fill="white"
          fillOpacity="0.95"
        />

        {/* Ghost eyes */}
        <circle cx="16" cy="18" r="2.2" fill="#030303" />
        <circle cx="24" cy="18" r="2.2" fill="#030303" />

        {/* Mail envelope on the ghost body */}
        <rect x="15" y="22" width="10" height="6" rx="1.5" fill="url(#logo-grad)" fillOpacity="0.9" />
        <path
          d="M15 22.5l5 3 5-3"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className="text-xl font-bold text-[var(--relay-text)] tracking-tight">
          Ghost<span className="relay-gradient-text">Relay</span>
        </span>
      )}
    </span>
  );
}
