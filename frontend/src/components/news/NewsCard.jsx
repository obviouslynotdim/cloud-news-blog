import { formatDate } from '../../utils/date';

export function NewsCard({ post, onOpen, index = 0 }) {
  return (
    <article className="card-reveal overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm" style={{ animationDelay: `${index * 70}ms` }}>
      <img src={post.imageUrl} alt={post.title} className="h-44 w-full object-cover" />
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {post.category} • {formatDate(post.publishedAt)} • {post.author}
        </p>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-zinc-950">{post.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">{post.summary}</p>
        <button className="mt-4 text-sm font-bold text-[#b80000]" onClick={() => onOpen(post.slug)}>
          Read full story
        </button>
      </div>
    </article>
  );
}
