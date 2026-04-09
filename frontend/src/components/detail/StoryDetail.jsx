import { formatDate } from '../../utils/date';

export function StoryDetail({ post, onBack }) {
  if (!post) {
    return null;
  }

  return (
    <article className="mx-auto max-w-3xl rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
      <button className="text-sm font-bold text-[#b80000]" onClick={onBack}>
        Back to news
      </button>
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
