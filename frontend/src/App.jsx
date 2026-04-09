import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthPanel } from './components/auth/AuthPanel';
import { AppHeader } from './components/layout/AppHeader';
import { AppShell } from './components/layout/AppShell';
import { ADMIN_PASSWORD, ADMIN_USERNAME, AUTH_STORAGE_KEY, THEME_STORAGE_KEY, USERS_STORAGE_KEY } from './config/constants';
import { useNewsFeed } from './hooks/useNewsFeed';
import { DetailPage } from './pages/DetailPage';
import { HomePage } from './pages/HomePage';
import { NewsPage } from './pages/NewsPage';
import { PublishPage } from './pages/PublishPage';

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function readStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function getInitialTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark') {
      return true;
    }
    if (storedTheme === 'light') {
      return false;
    }
  } catch {
    // Ignore storage errors and use system preference.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function DetailRoute({ posts, ensurePostLoaded }) {
  const { slug = '' } = useParams();

  useEffect(() => {
    if (!slug) {
      return;
    }

    ensurePostLoaded(slug);
  }, [slug, ensurePostLoaded]);

  const selectedPost = useMemo(() => posts.find((post) => post.slug === slug), [posts, slug]);

  return <DetailPage post={selectedPost} backHref="/news" />;
}

function AuthRoute({ status, onLogin, onRegister }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  function setMode(nextMode) {
    const params = new URLSearchParams(searchParams);
    params.set('mode', nextMode);
    setSearchParams(params, { replace: true });
  }

  return <AuthPanel mode={mode} setMode={setMode} onLogin={onLogin} onRegister={onRegister} status={status} />;
}

export default function App() {
  const [authStatus, setAuthStatus] = useState('');
  const [authUser, setAuthUser] = useState(() => readStoredAuth());
  const [isDarkMode, setIsDarkMode] = useState(() => getInitialTheme());
  const [newsRefreshSignal, setNewsRefreshSignal] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters, posts, loading, setPage, pagination, ensurePostLoaded } = useNewsFeed(newsRefreshSignal);

  const isNewsListRoute = location.pathname === '/news';

  useEffect(() => {
    if (!authUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  }, [authUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors for theme persistence.
    }
  }, [isDarkMode]);

  function toggleTheme() {
    setIsDarkMode((prev) => !prev);
  }

  useEffect(() => {
    if (!isNewsListRoute) {
      return;
    }

    const nextQ = searchParams.get('q') || '';
    const nextCategory = searchParams.get('category') || '';
    const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const nextPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    if (filters.q !== nextQ || filters.category !== nextCategory) {
      setFilters((prev) => ({ ...prev, q: nextQ, category: nextCategory }));
    }

    setPage((prevPage) => (prevPage === nextPage ? prevPage : nextPage));
  }, [isNewsListRoute, searchParams, filters.q, filters.category, setFilters, setPage]);

  useEffect(() => {
    if (!isNewsListRoute) {
      return;
    }

    const params = new URLSearchParams();
    if (filters.q) {
      params.set('q', filters.q);
    }
    if (filters.category) {
      params.set('category', filters.category);
    }
    if (pagination.page > 1) {
      params.set('page', String(pagination.page));
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [isNewsListRoute, filters.q, filters.category, pagination.page, searchParams, setSearchParams]);

  function handleNewsFiltersChange(updater) {
    setFilters((prev) => {
      const nextFilters = typeof updater === 'function' ? updater(prev) : updater;
      return nextFilters;
    });
    setPage(1);
  }

  async function openStory(slug) {
    navigate(`/news/${slug}`);
  }

  function openAuth(mode = 'login') {
    setAuthStatus('');
    navigate(`/auth?mode=${mode}`);
  }

  function logout() {
    setAuthUser(null);
    setAuthStatus('You have been signed out.');
    navigate('/');
  }

  async function login({ username, password }) {
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setAuthStatus('Enter a username and password.');
      return;
    }

    if (!ADMIN_PASSWORD) {
      setAuthStatus('Admin login is not configured in frontend environment variables.');
      return;
    }

    if (normalizedUsername === ADMIN_USERNAME) {
      if (password !== ADMIN_PASSWORD) {
        setAuthStatus('Invalid admin credentials.');
        return;
      }

      setAuthUser({ username: normalizedUsername, role: 'admin' });
      setAuthStatus('Admin login successful.');
      navigate('/');
      return;
    }

    if (password === ADMIN_PASSWORD) {
      setAuthStatus('Admin password can only be used with the configured admin username.');
      return;
    }

    const users = readStoredUsers();
    const matchedUser = users.find((user) => user.username === normalizedUsername);

    if (!matchedUser || matchedUser.password !== password) {
      setAuthStatus('User credentials not found. Register first or check your password.');
      return;
    }

    setAuthUser({ username: normalizedUsername, role: 'user' });
    setAuthStatus('User login successful.');
    navigate('/');
  }

  async function register({ username, password, confirmPassword }) {
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password || !confirmPassword) {
      setAuthStatus('Please fill in all fields.');
      return;
    }

    if (normalizedUsername === ADMIN_USERNAME) {
      setAuthStatus('This username is reserved for the admin role.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthStatus('Passwords do not match.');
      return;
    }

    const users = readStoredUsers();
    if (users.some((user) => user.username === normalizedUsername)) {
      setAuthStatus('Username already exists. Please choose another one.');
      return;
    }

    const nextUsers = [...users, { username: normalizedUsername, password }];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    setAuthStatus('Registration successful. You can now login as user.');
    navigate('/auth?mode=login', { replace: true });
  }

  return (
    <AppShell>
      <AppHeader authUser={authUser} onOpenAuth={openAuth} onLogout={logout} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      <Routes>
        <Route path="/" element={<HomePage onBrowseNews={() => navigate('/news')} onOpenAuth={openAuth} posts={posts} onOpenStory={openStory} authUser={authUser} />} />
        <Route
          path="/news"
          element={
            <NewsPage
              filters={filters}
              setFilters={handleNewsFiltersChange}
              loading={loading}
              posts={posts}
              pagination={pagination}
              setPage={setPage}
              onOpenStory={openStory}
            />
          }
        />
        <Route path="/news/:slug" element={<DetailRoute posts={posts} ensurePostLoaded={ensurePostLoaded} />} />
        <Route
          path="/publish"
          element={
            <PublishPage
              onCreated={openStory}
              authUser={authUser}
              onOpenAuth={openAuth}
              onContentChanged={() => setNewsRefreshSignal((prev) => prev + 1)}
            />
          }
        />
        <Route path="/auth" element={<AuthRoute status={authStatus} onLogin={login} onRegister={register} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
