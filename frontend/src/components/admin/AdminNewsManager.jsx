import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../../config/constants';
import { buildApiUrl } from '../../utils/api';
import { formatDate } from '../../utils/date';

const PAGE_LIMIT = 10;
const CACHE_MAX_ENTRIES = 10;

function toEditablePost(post) {
  return {
    title: post.title,
    summary: post.summary,
    category: post.category,
    author: post.author,
    content: post.content,
    imageUrl: post.imageUrl
  };
}

export function AdminNewsManager({ refreshKey = 0, onMutated }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [editingSlug, setEditingSlug] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState('');
  const [deleteDoneDialog, setDeleteDoneDialog] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_LIMIT });
  const cacheRef = useRef(new Map());

  function buildCacheKey(currentQuery, currentPage) {
    return `${currentQuery.trim().toLowerCase()}|${currentPage}`;
  }

  function setCacheEntry(key, payload) {
    const cache = cacheRef.current;
    if (cache.has(key)) {
      cache.delete(key);
    }

    if (cache.size >= CACHE_MAX_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, payload);
  }

  function clearCache() {
    cacheRef.current.clear();
  }

  function showNotice(type, message) {
    setNotice({ type, message });
  }

  const deleteTarget = confirmDeleteSlug ? posts.find((post) => post.slug === confirmDeleteSlug) : null;

  function applyPayload(payload) {
    setPosts(payload.posts || []);
    setPagination({
      page: payload.page || 1,
      totalPages: payload.totalPages || 1,
      total: payload.total || 0,
      limit: payload.limit || PAGE_LIMIT
    });
  }

  async function loadPosts() {
    setLoading(true);

    const cacheKey = buildCacheKey(searchQuery, page);
    const cachedPayload = cacheRef.current.get(cacheKey);
    if (cachedPayload) {
      applyPayload(cachedPayload);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
      if (searchQuery) {
        params.set('q', searchQuery);
      }

      const response = await fetch(buildApiUrl(`/api/news?${params.toString()}`));
      const result = await response.json();
      if (!response.ok) {
        showNotice('error', result.error || 'Failed to load posts.');
        setLoading(false);
        return;
      }

      applyPayload(result);
      setCacheEntry(cacheKey, result);

      if (result.page && result.page !== page) {
        setPage(result.page);
      }
    } catch {
      showNotice('error', 'Failed to load posts.');
    }

    setLoading(false);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      const normalizedQuery = searchInput.trim();
      setSearchQuery(normalizedQuery);
      setPage(1);
    }, 260);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(() => {
      setNotice(null);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    loadPosts();
  }, [searchQuery, page]);

  useEffect(() => {
    clearCache();
    setPage(1);
    setNotice(null);
    setEditingSlug('');
    setEditForm(null);
    setConfirmDeleteSlug('');
    setDeleteDoneDialog(false);
  }, [refreshKey]);

  function startEdit(post) {
    setEditingSlug(post.slug);
    setEditForm(toEditablePost(post));
    setConfirmDeleteSlug('');
    setNotice(null);
  }

  function cancelEdit() {
    setEditingSlug('');
    setEditForm(null);
  }

  async function saveEdit(slug) {
    if (!editForm) {
      return;
    }

    showNotice('warning', 'Saving changes...');

    const response = await fetch(buildApiUrl(`/api/news/${slug}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });

    const result = await response.json();
    if (!response.ok) {
      showNotice('error', result.error || 'Update failed.');
      return;
    }

    clearCache();
    await loadPosts();
    showNotice('success', 'Story updated successfully.');
    onMutated?.();
    cancelEdit();
  }

  async function removePost(slug) {
    const response = await fetch(buildApiUrl(`/api/news/${slug}`), {
      method: 'DELETE'
    });

    if (!response.ok) {
      let errorMessage = 'Delete failed.';
      try {
        const result = await response.json();
        errorMessage = result.error || errorMessage;
      } catch {
        // Keep default error message when response body is empty.
      }
      showNotice('error', errorMessage);
      return;
    }

    clearCache();
    await loadPosts();
    setNotice(null);
    setConfirmDeleteSlug('');
    setDeleteDoneDialog(true);
    onMutated?.();

    if (editingSlug === slug) {
      cancelEdit();
    }
  }

  return (
    <>
      {notice ? (
        <div
          className={`fixed left-1/2 top-5 z-50 flex w-[min(92vw,640px)] -translate-x-1/2 items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm font-semibold shadow-lg ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : notice.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
          role="status"
          aria-live="polite"
        >
          <p>{notice.message}</p>
          <button className="text-xs font-bold uppercase" onClick={() => setNotice(null)}>
            Close
          </button>
        </div>
      ) : null}

      {confirmDeleteSlug ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h4 className="font-serif text-2xl text-zinc-950">Delete story?</h4>
            <p className="mt-2 text-sm text-zinc-600">
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.title}"` : ' this story'}? This action cannot be undone.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700"
                onClick={() => setConfirmDeleteSlug('')}
              >
                Cancel
              </button>
              <button className="rounded-md bg-[#b80000] px-3 py-2 text-sm font-bold text-white" onClick={() => removePost(confirmDeleteSlug)}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteDoneDialog ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h4 className="font-serif text-2xl text-zinc-950">Deleted successfully</h4>
            <p className="mt-2 text-sm text-zinc-600">The story has been removed.</p>
            <div className="mt-5 flex justify-end">
              <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-bold text-white" onClick={() => setDeleteDoneDialog(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mt-8 rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-serif text-2xl text-zinc-950">Manage stories</h3>
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
          onClick={() => {
            clearCache();
            loadPosts();
          }}
        >
          Refresh
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by title, summary, or content"
          className="rounded-md border border-zinc-300 px-3 py-2"
        />
        <p className="text-sm font-semibold text-zinc-600">
          {pagination.total} total • page {pagination.page} of {pagination.totalPages}
        </p>
      </div>

      {loading ? <p className="text-zinc-500">Loading stories...</p> : null}
      {!loading && posts.length === 0 ? <p className="text-zinc-500">No stories available.</p> : null}

      <div className="grid gap-4">
        {posts.map((post) => {
          const isEditing = editingSlug === post.slug;

          return (
            <article key={post.slug} className="rounded-lg border border-zinc-200 p-4">
              {isEditing && editForm ? (
                <div className="grid gap-3">
                  <input
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    value={editForm.title}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Title"
                  />
                  <input
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    value={editForm.summary}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, summary: event.target.value }))}
                    placeholder="Summary"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      className="rounded-md border border-zinc-300 px-3 py-2"
                      value={editForm.category}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <input
                      className="rounded-md border border-zinc-300 px-3 py-2"
                      value={editForm.author}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, author: event.target.value }))}
                      placeholder="Author"
                    />
                  </div>
                  <input
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    value={editForm.imageUrl}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    placeholder="Image URL"
                  />
                  <textarea
                    rows={5}
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    value={editForm.content}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))}
                    placeholder="Content"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-bold text-white" onClick={() => saveEdit(post.slug)}>
                      Save
                    </button>
                    <button className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {post.category} • {formatDate(post.publishedAt)} • {post.author}
                  </p>
                  <h4 className="mt-1 font-serif text-2xl text-zinc-950">{post.title}</h4>
                  <p className="mt-2 text-sm text-zinc-600">{post.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700" onClick={() => startEdit(post)}>
                      Edit
                    </button>
                    <button
                      className="rounded-md bg-[#b80000] px-3 py-2 text-sm font-bold text-white"
                      onClick={() => {
                        setConfirmDeleteSlug(post.slug);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      {pagination.totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={pagination.page <= 1 || loading}
          >
            Previous
          </button>
          <p className="text-sm font-semibold text-zinc-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <button
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </button>
        </div>
      ) : null}
      </section>
    </>
  );
}
