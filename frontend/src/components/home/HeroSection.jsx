import { theme } from '../../theme/theme';

export function HeroSection({ setTab }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-cyan-700 to-sky-900 p-8 text-white shadow-glow md:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-100">{theme.tagline}</p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
        Read global blog news with clear context, not noisy headlines.
      </h1>
      <p className="mt-4 max-w-2xl text-cyan-50/95">
        Track world news, creator stories, product updates, and practical insight in one professional feed.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button className="rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-slate-900" onClick={() => setTab('news')}>
          Browse News
        </button>
        <button
          className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-extrabold text-white backdrop-blur"
          onClick={() => setTab('publish')}
        >
          Publish Story
        </button>
      </div>
    </section>
  );
}
