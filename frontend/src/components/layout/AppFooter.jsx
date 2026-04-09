import { theme } from '../../theme/theme';

export function AppFooter() {
  return (
    <footer className="mt-12 border-t border-zinc-300 py-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-800">{theme.brandName}</p>
          <p className="mt-1 text-sm text-zinc-600">Professional global news coverage with clear context.</p>
        </div>

        <nav className="flex items-center gap-4 text-sm font-semibold text-zinc-700">
          <a href="#" className="hover:text-zinc-950">
            About
          </a>
          <a href="#" className="hover:text-zinc-950">
            Contact
          </a>
          <a href="#" className="hover:text-zinc-950">
            Privacy
          </a>
        </nav>
      </div>

      <p className="mt-5 text-xs text-zinc-500">© {new Date().getFullYear()} {theme.brandName}. All rights reserved.</p>
    </footer>
  );
}
