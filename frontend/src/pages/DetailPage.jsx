import { StoryDetail } from '../components/detail/StoryDetail';

export function DetailPage({ post, onBack }) {
  return <StoryDetail post={post} onBack={onBack} />;
}
