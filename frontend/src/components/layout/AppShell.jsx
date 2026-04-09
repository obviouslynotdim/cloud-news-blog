import { AppFooter } from './AppFooter';

export function AppShell({ children }) {
  return (
    <div className="page-enter min-h-screen px-4 pb-10">
      <main className="mx-auto w-full max-w-6xl">
        {children}
        <AppFooter />
      </main>
    </div>
  );
}
