import { Suspense } from "react";
import Feed from "../../../../features/feed/Feed";
import Loader from "../../../../components/common/Loader";

export default function FeedPage() {
  return (
    <Suspense fallback={<Loader fullPage={false} />}>
      <Feed />
    </Suspense>
  );
}
