import { CATEGORIES } from '../../config/constants';

export function NewsFilters({ filters, setFilters }) {
  return (
    <section className="my-5 grid gap-3 md:grid-cols-[1fr_220px]">
      <input
        type="text"
        value={filters.q}
        onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        placeholder="Search by title, summary, or content"
        className="rounded-md border border-zinc-300 bg-white px-4 py-3"
      />
      <select
        value={filters.category}
        onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
        className="rounded-md border border-zinc-300 bg-white px-4 py-3"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </section>
  );
}
