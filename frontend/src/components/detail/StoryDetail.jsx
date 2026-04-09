import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/date';

export function StoryDetail({ post, backHref = '/news' }) {
  if (!post) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
        <p className="text-zinc-700">Story not found or still loading.</p>
        <Link className="mt-3 inline-flex text-sm font-bold text-[#b80000] hover:underline" to={backHref}>
          Back to news
        </Link>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
      <Link className="inline-flex items-center gap-1 text-sm font-bold text-[#b80000] hover:underline" to={backHref}>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M11.5 4.5L6 10l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 10h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Back to news
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {post.category} • {formatDate(post.publishedAt)} • {post.author}
      </p>
      <h1 className="mt-2 font-serif text-4xl leading-tight text-zinc-950">{post.title}</h1>
      <img src={post.imageUrl} alt={post.title} className="mt-4 h-72 w-full rounded-md object-cover" />
      <p className="mt-4 text-lg text-zinc-700">{post.summary}</p>
      <p className="mt-4 leading-relaxed text-zinc-700">{post.content}</p>
    </article>
  );
}
