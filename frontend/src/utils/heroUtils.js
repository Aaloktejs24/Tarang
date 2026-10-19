import { getNoNamePlaceholder, capitalizeFirstLetter } from './stringUtils';

export function getHeroPropsFromProfile(profile, language, explicitProps = {}) {
  const {
    title: explicitTitle,
    subtitle: explicitSubtitle,
    bannerUrl: explicitBannerUrl,
    avatarUrl: explicitAvatarUrl,
  } = explicitProps;

  const safeProfile = profile ?? {};

  const primaryName = safeProfile.primary_name || safeProfile.full_name || safeProfile.name || safeProfile.username || '';
  const secondaryName = safeProfile.secondary_name || '';

  let defaultTitle = '';
  let defaultSubtitle = '';

  if (primaryName && secondaryName) {
    defaultTitle = capitalizeFirstLetter(primaryName);
    defaultSubtitle = capitalizeFirstLetter(secondaryName);
  } else if (primaryName || secondaryName) {
    defaultTitle = capitalizeFirstLetter(primaryName || secondaryName);
    defaultSubtitle = '';
  } else {
    defaultTitle = '';
    defaultSubtitle = '';
  }

  const title = explicitTitle || defaultTitle;
  const subtitle = explicitSubtitle !== undefined ? explicitSubtitle : defaultSubtitle;
  const isManagement = safeProfile?.role === 'institute' || safeProfile?.role === 'admin';

  const defaultBannerUrl = isManagement
    ? (safeProfile?.institute_profile?.banner_url || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000")
    : (safeProfile?.banner_url || '');

  const defaultAvatarUrl = isManagement
    ? (safeProfile?.institute_profile?.logo_url || '')
    : (safeProfile?.profile_pic_url || '');

  const bannerUrl = explicitBannerUrl || defaultBannerUrl;
  const avatarUrl = explicitAvatarUrl || defaultAvatarUrl;

  // If profile is not yet loaded, return empty URLs so the bg preloader
  // doesn't trigger the full-window loader during the skeleton phase.
  if (!profile) {
    return { title, subtitle, bannerUrl: '', avatarUrl: '' };
  }

  return {
    title,
    subtitle,
    bannerUrl,
    avatarUrl
  };
}
