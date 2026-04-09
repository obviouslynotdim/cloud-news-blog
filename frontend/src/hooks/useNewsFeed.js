import { useCallback, useEffect, useState } from 'react';
import { PAGE_SIZE } from '../config/constants';
import { buildApiUrl } from '../utils/api';

export function useNewsFeed(refreshSignal = 0) {
  const [filters, setFilters] = useState({ q: '', category: '' });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_SIZE });

  const loadPosts = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.q) {
      params.set('q', filters.q);
    }
    if (filters.category) {
      params.set('category', filters.category);
    }

    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));

    const response = await fetch(buildApiUrl(`/api/news?${params.toString()}`));
    const result = await response.json();

    setPosts(result.posts || []);
    setPagination({
      page: result.page || 1,
      totalPages: result.totalPages || 1,
      total: result.total || (result.posts || []).length,
      limit: result.limit || PAGE_SIZE
    });

    if (result.page && result.page !== page) {
      setPage(result.page);
    }

    setLoading(false);
  }, [filters.q, filters.category, page, refreshSignal]);

  useEffect(() => {
    setPage(1);
  }, [filters.q, filters.category]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function ensurePostLoaded(slug) {
    if (posts.find((post) => post.slug === slug)) {
      return;
    }

    const response = await fetch(buildApiUrl(`/api/news/${slug}`));
    if (!response.ok) {
      return;
    }

    const result = await response.json();
    setPosts((prev) => [result.post, ...prev.filter((item) => item.slug !== result.post.slug)]);
  }

  return {
    filters,
    setFilters,
    posts,
    loading,
    page,
    setPage,
    pagination,
    ensurePostLoaded
  };
}
