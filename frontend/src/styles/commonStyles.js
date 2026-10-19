export const glassPaperSx = {
  borderRadius: 'var(--radius-lg)',
  marginTop: '8px',
  border: 'var(--border-thin) solid var(--card-border)',
  backdropFilter: "var(--popover-blur)",
  WebkitBackdropFilter: "var(--popover-blur)",
  backgroundColor: "var(--popover-bg)",
  backgroundImage: "none",
  boxShadow: "none"
};

/**
 * Eliminates browser rubber-band / overscroll bounce gap at scroll boundaries.
 * Technique standardized from RichQuestionEditor.
 */
export const noOverscrollSx = {
  overscrollBehavior: 'none',
  overscrollBehaviorY: 'none',
  WebkitOverflowScrolling: 'touch',
};

/**
 * Reusable scroll container style that provides contained scrolling without
 * scroll-chaining or rubber-band gaps at the top/bottom boundaries.
 */
export const containedScrollSx = {
  overflowY: 'auto',
  overscrollBehavior: 'none',
  overscrollBehaviorY: 'none',
  WebkitOverflowScrolling: 'touch',
};

/**
 * Viewport-contained full layout wrapper below fixed navbar (72px) that eliminates
 * outer window scroll and prevents scroll gap exposure.
 */
export const fixedViewportLayoutSx = {
  height: { xs: 'auto', md: 'calc(100vh - 72px)' },
  minHeight: { xs: 'auto', md: 'calc(100vh - 72px)' },
  maxHeight: { xs: 'auto', md: 'calc(100vh - 72px)' },
  overflow: { xs: 'auto', md: 'hidden' },
  overscrollBehavior: 'none',
  overscrollBehaviorY: 'none',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
};
