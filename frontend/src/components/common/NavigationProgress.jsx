"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

const NPROGRESS_STYLES = `
  #nprogress { pointer-events: none; }
  #nprogress .bar {
    background: var(--color-primary);
    position: fixed;
    z-index: 99999;
    top: 72px;
    left: 0;
    width: var(--size-full);
    height: 2px;
  }
  #nprogress .peg { display: none; }
  #nprogress .spinner { display: none; }
`;

NProgress.configure({ minimum: 0.1, easing: "ease", speed: 300, showSpinner: false });

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleNavStart = () => NProgress.start();
    window.addEventListener("navigation-start", handleNavStart);
    return () => {
      window.removeEventListener("navigation-start", handleNavStart);
    };
  }, []);

  // Page load complete — hide NProgress bar
  useEffect(() => {
    NProgress.done();
    return () => NProgress.done();
  }, [pathname, searchParams]);

  // window.history patch has been removed. Next.js App Router internally handles history,
  // and patching it causes race conditions where NProgress.start() is called right as the new page loads,
  // causing the progress bar to stay stuck on the screen.


  // <Link> aur <a href> clicks cover karo
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const isInternal = href.startsWith("/") || href.startsWith(window.location.origin) || !href.match(/^[a-zA-Z]+:/);
      const isHashOnly = href.startsWith("#");
      const isDownload = anchor.hasAttribute("download");
      const opensNewTab = anchor.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey;
      
      let targetUrl;
      try {
        targetUrl = new URL(href, window.location.href);
      } catch (e) {
        return;
      }
      
      const isSamePage = targetUrl.pathname === pathname && targetUrl.search === window.location.search;
      if (isInternal && !isSamePage && !isHashOnly && !isDownload && !opensNewTab) {
        NProgress.start();
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  return null;
}

export default function NavigationProgress() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NPROGRESS_STYLES }} />
      <Suspense fallback={null}>
        <NavigationProgressInner />
      </Suspense>
    </>
  );
}

export const navProgressStart = (href) => {
  if (typeof window === "undefined") return;
  // Same pathname navigate nahi karna — skip
  if (href) {
    try {
      const targetPathname = new URL(href, window.location.href).pathname;
      if (targetPathname === window.location.pathname) return;
    } catch (e) {}
  }
  window.dispatchEvent(new Event("navigation-start"));
};
