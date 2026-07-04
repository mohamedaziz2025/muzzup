import { SHOWCASE_CARDS } from "./floating-business-cards";

/**
 * Mobile-only stand-in for the desktop's absolutely-positioned floating cards (which stay hidden
 * below `sm` to avoid overlapping the centered hero text on narrow screens): a horizontal
 * snap-scroll strip of the same business previews, placed below the CTAs instead of behind them.
 */
export function HeroMobilePreview() {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-10 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SHOWCASE_CARDS.map((card) => (
        <div
          key={card.id}
          className="glass relative w-56 shrink-0 snap-start overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4 text-left shadow-xl shadow-black/10"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-60`} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-abyss/60 px-2 py-0.5 text-[10px] font-medium text-cyan">
                {card.label}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-medium text-gold">
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-2.5">
                  <path d="M10 1.5l2.4 5 5.6.8-4 4 1 5.5L10 14.9 5 16.8l1-5.5-4-4 5.6-.8L10 1.5z" />
                </svg>
                Sharia Vérifié
              </span>
            </div>
            <p className="mt-3 text-xs text-secondary">{card.sector}</p>
            <p className="mt-1 font-display text-lg font-bold text-primary">{card.revenue}</p>
            <p className="mt-1 text-[11px] text-muted">Multiple {card.multiple}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
