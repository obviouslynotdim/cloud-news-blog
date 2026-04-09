import { theme } from '../../theme/theme';

export function HeroSection({ onBrowseNews, onOpenAuth, authUser }) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-300 bg-white p-8 shadow-sm md:p-10">
      <p className="inline-block border-b-4 border-[#b80000] pb-1 text-xs font-bold uppercase tracking-[0.3em] text-zinc-700">{theme.tagline}</p>
      <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-zinc-950 md:text-5xl">News that feels factual, focused, and easy to scan.</h1>
      <p className="mt-4 max-w-2xl text-zinc-600">
        Follow global updates with concise summaries and full story context in one clean newsroom experience.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button className="rounded-md bg-zinc-900 px-5 py-3 text-sm font-extrabold text-white" onClick={onBrowseNews}>
          Browse News
        </button>
        {!authUser ? (
          <button className="rounded-md border border-zinc-300 bg-zinc-50 px-5 py-3 text-sm font-extrabold text-zinc-900" onClick={() => onOpenAuth('login')}>
            Login or Register
          </button>
        ) : null}
      </div>
    </section>
  );
}
