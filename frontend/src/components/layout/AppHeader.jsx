import { Link, NavLink } from 'react-router-dom';
import { theme } from '../../theme/theme';

const navItemClassName = ({ isActive }) =>
  `rounded px-4 py-2 text-sm font-bold capitalize transition ${isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`;

export function AppHeader({ authUser, onOpenAuth, onLogout, isDarkMode, onToggleTheme }) {
  const logoSrc = isDarkMode ? '/assets/news.png' : '/assets/logo.png';

  return (
    <header className="mx-auto mb-6 w-full max-w-6xl border-b border-zinc-200 bg-transparent py-4">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-200 pb-3">
        <Link className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-700" to="/">
          {theme.tagline}
        </Link>
        <p className="hidden text-xs font-medium text-zinc-500 md:block">Trusted updates, clear context</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="flex items-center gap-3" to="/">
          <img src={logoSrc} alt="Daily Global News logo" className="h-10 w-10 rounded-md border border-zinc-300 object-cover" />
          <span className="text-2xl font-black uppercase tracking-tight text-zinc-950">{theme.brandName}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
            onClick={onToggleTheme}
            type="button"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2.75V5.1M12 18.9v2.35M21.25 12H18.9M5.1 12H2.75M18.54 5.46l-1.66 1.66M7.12 16.88l-1.66 1.66M18.54 18.54l-1.66-1.66M7.12 7.12 5.46 5.46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6a8.5 8.5 0 1 0 10.6 10.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <nav className="flex rounded-md border border-zinc-300 bg-white p-1">
            <NavLink className={navItemClassName} to="/" end>
              Home
            </NavLink>
            <NavLink className={navItemClassName} to="/news">
              News
            </NavLink>

            {authUser?.role === 'admin' ? (
              <NavLink className={navItemClassName} to="/publish">
                Publish
              </NavLink>
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
