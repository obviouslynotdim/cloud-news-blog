import { NewsFilters } from '../components/news/NewsFilters';
import { NewsCard } from '../components/news/NewsCard';
import { PaginationControls } from '../components/news/PaginationControls';

export function NewsPage({ filters, setFilters, loading, posts, pagination, setPage, onOpenStory }) {
  return (
    <>
      <NewsFilters filters={filters} setFilters={setFilters} />
      {loading ? (
        <p className="text-slate-500">Loading stories...</p>
      ) : (
        <>
          <section className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <NewsCard key={post.id} post={post} onOpen={onOpenStory} index={index} />
            ))}
          </section>
          <PaginationControls page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
