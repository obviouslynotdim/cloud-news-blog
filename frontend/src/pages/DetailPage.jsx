import { StoryDetail } from '../components/detail/StoryDetail';

export function DetailPage({ post, backHref }) {
  return <StoryDetail post={post} backHref={backHref} />;
}
