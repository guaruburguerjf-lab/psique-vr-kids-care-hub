import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="psq" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary-glow)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="none" stroke="url(#psq)" strokeWidth="2.2" />
      <path d="M20 8v24M12 14c0 6 3.5 9 8 9s8-3 8-9" fill="none" stroke="url(#psq)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="20" cy="8" r="1.8" fill="var(--gold)" />
    </svg>
  );
}

export function Logo({ className, subtle }: { className?: string; subtle?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-none">
        <div className="font-display text-xl font-semibold tracking-wide">PSIQUE VR</div>
        {!subtle && <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold">+ Psique Kids</div>}
      </div>
    </div>
  );
}
