import { APP_TABS } from '../../config/constants';
import { theme } from '../../theme/theme';

export function AppHeader({ tab, setTab, authUser, onOpenAuth, onLogout }) {
  return (
    <header className="mx-auto mb-6 w-full max-w-6xl border-b border-zinc-200 bg-transparent py-4">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-200 pb-3">
        <button className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-700" onClick={() => setTab('home')}>
          {theme.tagline}
        </button>
        <p className="hidden text-xs font-medium text-zinc-500 md:block">Trusted updates, clear context</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="flex items-center gap-3" onClick={() => setTab('home')}>
          <img src="/assets/logo.png" alt="Daily Global News logo" className="h-10 w-10 rounded-md border border-zinc-300 object-cover" />
          <span className="text-2xl font-black uppercase tracking-tight text-zinc-950">{theme.brandName}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex rounded-md border border-zinc-300 bg-white p-1">
            {APP_TABS.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`rounded px-4 py-2 text-sm font-bold capitalize transition ${
                  tab === item ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {item}
              </button>
            ))}

            {authUser?.role === 'admin' ? (
              <button
                onClick={() => setTab('publish')}
                className={`rounded px-4 py-2 text-sm font-bold transition ${
                  tab === 'publish' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Publish
              </button>
            ) : null}
          </nav>

          {authUser ? (
            <>
              <div className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold uppercase text-zinc-700">
                {authUser.role}: {authUser.username}
              </div>
              <button
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-100"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-100"
                onClick={() => onOpenAuth('login')}
              >
                Login
              </button>
              <button className="rounded-md bg-[#b80000] px-3 py-2 text-sm font-bold text-white hover:bg-[#980000]" onClick={() => onOpenAuth('register')}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
