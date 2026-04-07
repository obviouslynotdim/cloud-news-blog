import { useMemo, useState } from 'react';
import { AppHeader } from './components/layout/AppHeader';
import { AppShell } from './components/layout/AppShell';
import { useNewsFeed } from './hooks/useNewsFeed';
import { DetailPage } from './pages/DetailPage';
import { HomePage } from './pages/HomePage';
import { NewsPage } from './pages/NewsPage';
import { PublishPage } from './pages/PublishPage';

export default function App() {
  const [tab, setTab] = useState('home');
  const [activeSlug, setActiveSlug] = useState('');
  const { filters, setFilters, posts, loading, setPage, pagination, ensurePostLoaded } = useNewsFeed();

  const selectedPost = useMemo(() => posts.find((post) => post.slug === activeSlug), [posts, activeSlug]);

  async function openStory(slug) {
    await ensurePostLoaded(slug);
    setActiveSlug(slug);
    setTab('detail');
  }

  return (
    <AppShell>
      <AppHeader tab={tab} setTab={setTab} />

      {tab === 'home' ? <HomePage setTab={setTab} posts={posts} onOpenStory={openStory} /> : null}

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

      {tab === 'publish' ? <PublishPage onCreated={openStory} /> : null}
      {tab === 'detail' ? <DetailPage post={selectedPost} onBack={() => setTab('news')} /> : null}
    </AppShell>
  );
}
