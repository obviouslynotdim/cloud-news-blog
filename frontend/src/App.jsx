import { useEffect, useMemo, useState } from 'react';
import { AuthPanel } from './components/auth/AuthPanel';
import { AppHeader } from './components/layout/AppHeader';
import { AppShell } from './components/layout/AppShell';
import { ADMIN_PASSWORD, ADMIN_USERNAME, AUTH_STORAGE_KEY, USERS_STORAGE_KEY } from './config/constants';
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

export default function App() {
  const [tab, setTab] = useState('home');
  const [activeSlug, setActiveSlug] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authStatus, setAuthStatus] = useState('');
  const [authUser, setAuthUser] = useState(() => readStoredAuth());
  const [newsRefreshSignal, setNewsRefreshSignal] = useState(0);
  const { filters, setFilters, posts, loading, setPage, pagination, ensurePostLoaded } = useNewsFeed(newsRefreshSignal);

  const selectedPost = useMemo(() => posts.find((post) => post.slug === activeSlug), [posts, activeSlug]);

  useEffect(() => {
    if (!authUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  }, [authUser]);

  async function openStory(slug) {
    await ensurePostLoaded(slug);
    setActiveSlug(slug);
    setTab('detail');
  }

  function openAuth(mode = 'login') {
    setAuthMode(mode);
    setAuthStatus('');
    setTab('auth');
  }

  function logout() {
    setAuthUser(null);
    setAuthStatus('You have been signed out.');
    setTab('home');
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
      setTab('home');
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
    setTab('home');
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
    setAuthMode('login');
  }

  return (
    <AppShell>
      <AppHeader tab={tab} setTab={setTab} authUser={authUser} onOpenAuth={openAuth} onLogout={logout} />

      {tab === 'home' ? <HomePage setTab={setTab} posts={posts} onOpenStory={openStory} authUser={authUser} /> : null}

      {tab === 'news' ? (
        <NewsPage
          filters={filters}
          setFilters={setFilters}
          loading={loading}
          posts={posts}
          pagination={pagination}
          setPage={setPage}
          onOpenStory={openStory}
        />
      ) : null}

      {tab === 'publish' ? (
        <PublishPage
          onCreated={openStory}
          authUser={authUser}
          onOpenAuth={openAuth}
          onContentChanged={() => setNewsRefreshSignal((prev) => prev + 1)}
        />
      ) : null}
      {tab === 'auth' ? (
        <AuthPanel mode={authMode} setMode={setAuthMode} onLogin={login} onRegister={register} status={authStatus} />
      ) : null}
      {tab === 'detail' ? <DetailPage post={selectedPost} onBack={() => setTab('news')} /> : null}
    </AppShell>
  );
}
