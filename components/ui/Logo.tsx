import clsx from 'clsx';

export default function Logo({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <div className={clsx('flex items-center gap-2.5 select-none', className)}>
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-1.5 shadow-sm shadow-indigo-500/20">
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 13C7 13 12 7 21 7C30 7 32 13 32 13"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M5 20C5 20 11 14 22 14C33 14 35 20 35 20"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M9 27C9 27 14 22 22 22C30 22 32 27 32 27"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-bold tracking-tight text-wind-text font-sans">
          Wind
        </span>
        <span className="rounded-md bg-indigo-500/10 dark:bg-indigo-400/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
          AI
        </span>
      </div>
    </div>
  );
}
