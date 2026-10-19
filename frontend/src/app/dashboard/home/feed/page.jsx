import { Suspense } from "react";
import Feed from "../../../../features/feed/Feed";
import FeedSkeleton from "../../../../features/feed/FeedSkeleton";

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton count={6} />}>
      <Feed />
    </Suspense>
  );
}
