import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function Header({ tab, setTab }) {
  const items = ['home', 'news', 'publish'];
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-5">
      <button className="text-xl font-extrabold tracking-tight text-slate-900" onClick={() => setTab('home')}>
        Cloud News Blog
      </button>
      <nav className="flex gap-2 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
        {items.map((item) => (
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

function Hero({ setTab }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-cyan-700 to-sky-900 p-8 text-white shadow-glow md:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-100">Daily cloud intelligence</p>
      <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
        Read modern cloud news with clear context, not noisy headlines.
      </h1>
      <p className="mt-4 max-w-2xl text-cyan-50/95">
        Track platform releases, security advisories, and FinOps guidance in one professional feed.
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

function NewsCard({ post, onOpen }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img src={post.imageUrl} alt={post.title} className="h-44 w-full object-cover" />
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {post.category} • {formatDate(post.publishedAt)} • {post.author}
        </p>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-slate-900">{post.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{post.summary}</p>
        <button className="mt-4 text-sm font-bold text-teal-700" onClick={() => onOpen(post.slug)}>
          Read full story
        </button>
      </div>
    </article>
  );
}

function Filters({ filters, setFilters }) {
  return (
    <section className="my-5 grid gap-3 md:grid-cols-[1fr_220px]">
      <input
        type="text"
        value={filters.q}
        onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        placeholder="Search by title, summary, or content"
        className="rounded-xl border border-slate-200 bg-white px-4 py-3"
      />
      <select
        value={filters.category}
        onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3"
      >
        <option value="">All categories</option>
        <option value="Cloud">Cloud</option>
        <option value="Security">Security</option>
        <option value="FinOps">FinOps</option>
      </select>
    </section>
  );
}

function PublishForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    summary: '',
    category: 'Cloud',
    author: '',
    content: ''
  });
  const [status, setStatus] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  async function onSubmit(event) {
    event.preventDefault();

    if (!imageFile) {
      setStatus('Please choose a cover image first.');
      return;
    }

    setStatus('Uploading image...');

    const uploadBody = new FormData();
    uploadBody.append('image', imageFile);

    const uploadResponse = await fetch(buildApiUrl('/api/uploads/image'), {
      method: 'POST',
      body: uploadBody
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResponse.ok) {
      setStatus(uploadResult.error || 'Image upload failed');
      return;
    }

    setStatus('Publishing story...');

    const response = await fetch(buildApiUrl('/api/news'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, imageUrl: uploadResult.imageUrl })
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || 'Publish failed');
      return;
    }

    setStatus('Published successfully');
    setForm({ title: '', summary: '', category: 'Cloud', author: '', content: '' });
    setImageFile(null);
    setImagePreviewUrl('');
    onCreated(result.post.slug);
  }

  function onImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreviewUrl('');
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl">Publish a story</h2>
      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm font-bold">
          Title
          <input
            required
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Summary
          <input
            required
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Category
            <select
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="Cloud">Cloud</option>
              <option value="Security">Security</option>
              <option value="FinOps">FinOps</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Author
            <input
              required
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={form.author}
              onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-bold">
          Cover image file
          <input
            required
            type="file"
            accept="image/*"
            className="rounded-lg border border-slate-200 px-3 py-2"
            onChange={onImageChange}
          />
        </label>
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Image preview" className="h-48 w-full rounded-lg border border-slate-200 object-cover" />
        ) : null}
        <label className="grid gap-1 text-sm font-bold">
          Content
          <textarea
            required
            rows={7}
            className="rounded-lg border border-slate-200 px-3 py-2"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
          />
        </label>
        <button className="w-fit rounded-xl bg-teal-700 px-5 py-3 text-sm font-extrabold text-white" type="submit">
          Publish story
        </button>
      </form>
      {status ? <p className="mt-3 text-sm font-semibold text-teal-700">{status}</p> : null}
    </section>
  );
}

function Detail({ post, onBack }) {
  if (!post) return null;
  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button className="text-sm font-bold text-teal-700" onClick={onBack}>
        Back to news
      </button>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {post.category} • {formatDate(post.publishedAt)} • {post.author}
      </p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">{post.title}</h1>
      <img src={post.imageUrl} alt={post.title} className="mt-4 h-72 w-full rounded-xl object-cover" />
      <p className="mt-4 text-lg text-slate-700">{post.summary}</p>
      <p className="mt-4 leading-relaxed text-slate-700">{post.content}</p>
    </article>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [filters, setFilters] = useState({ q: '', category: '' });
  const [posts, setPosts] = useState([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    const response = await fetch(buildApiUrl(`/api/news?${params.toString()}`));
    const result = await response.json();
    setPosts(result.posts || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, [filters.q, filters.category]);

  const selectedPost = useMemo(() => posts.find((post) => post.slug === activeSlug), [posts, activeSlug]);

  async function openStory(slug) {
    if (!posts.find((post) => post.slug === slug)) {
      const response = await fetch(buildApiUrl(`/api/news/${slug}`));
      if (response.ok) {
        const result = await response.json();
        setPosts((prev) => [result.post, ...prev.filter((item) => item.slug !== result.post.slug)]);
      }
    }
    setActiveSlug(slug);
    setTab('detail');
  }

  return (
    <div className="min-h-screen px-4 pb-10">
      <Header tab={tab} setTab={setTab} />
      <main className="mx-auto w-full max-w-6xl">
        {tab === 'home' && <Hero setTab={setTab} />}
        {tab === 'home' && <h2 className="mt-6 font-serif text-3xl">Latest stories</h2>}
        {tab === 'home' && <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{posts.slice(0, 3).map((post) => <NewsCard key={post.id} post={post} onOpen={openStory} />)}</section>}

        {tab === 'news' && <Filters filters={filters} setFilters={setFilters} />}
        {tab === 'news' && (loading ? <p className="text-slate-500">Loading stories...</p> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <NewsCard key={post.id} post={post} onOpen={openStory} />)}</section>)}

        {tab === 'publish' && <PublishForm onCreated={openStory} />}
        {tab === 'detail' && <Detail post={selectedPost} onBack={() => setTab('news')} />}
      </main>
    </div>
  );
}
