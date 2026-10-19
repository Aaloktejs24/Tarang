import { useRouter as useNextRouter } from 'next/navigation';
import { useLoading } from '../contexts/LoadingContext';

export function useAppRouter() {
  const router = useNextRouter();

  return {
    ...router,
    push: (...args) => {
      return router.push(...args);
    },
    replace: (...args) => {
      return router.replace(...args);
    }
  };
}
