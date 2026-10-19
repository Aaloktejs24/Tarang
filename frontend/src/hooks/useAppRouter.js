import { useRouter as useNextRouter } from 'next/navigation';
import { navProgressStart } from '../components/common/NavigationProgress';

export function useAppRouter() {
  const router = useNextRouter();

  return {
    ...router,
    push: (href, ...rest) => {
      navProgressStart(href);
      return router.push(href, ...rest);
    },
    replace: (href, ...rest) => {
      navProgressStart(href);
      return router.replace(href, ...rest);
    }
  };
}
