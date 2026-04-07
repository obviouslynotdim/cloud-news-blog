import { APP_TABS } from '../../config/constants';
import { theme } from '../../theme/theme';

export function AppHeader({ tab, setTab }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-5">
      <button className="text-xl font-extrabold tracking-tight text-slate-900" onClick={() => setTab('home')}>
        {theme.brandName}
      </button>
      <nav className="flex gap-2 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
        {APP_TABS.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
              tab === item ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}
