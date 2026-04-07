import { HeroSection } from '../components/home/HeroSection';
import { NewsCard } from '../components/news/NewsCard';

export function HomePage({ setTab, posts, onOpenStory }) {
  return (
    <>
      <HeroSection setTab={setTab} />
      <h2 className="mt-6 font-serif text-3xl">Latest stories</h2>
      <section className="stagger-grid mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.slice(0, 3).map((post, index) => (
          <NewsCard key={post.id} post={post} onOpen={onOpenStory} index={index} />
        ))}
      </section>
    </>
  );
}
