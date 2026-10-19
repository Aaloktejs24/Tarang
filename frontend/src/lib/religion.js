/**
 * Religion options — sourced from data/formated/religion.json
 * Sorted with pinned top items first, pinned bottom items last, rest alphabetical.
 */
import data from '../data/formated/religion.json';

const { options, pinTop, pinBottom } = data;

export const RELIGION_OPTIONS = [...options].sort((a, b) => {
  if (pinBottom.includes(a) && pinBottom.includes(b)) return 0;
  if (pinBottom.includes(a)) return 1;
  if (pinBottom.includes(b)) return -1;

  const ai = pinTop.indexOf(a);
  const bi = pinTop.indexOf(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;

  return a.localeCompare(b);
});
