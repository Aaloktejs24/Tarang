import { getNoNamePlaceholder, capitalizeFirstLetter, parseBilingualName } from './stringUtils';

export function getHeroPropsFromProfile(profile, language, explicitProps = {}) {
  const {
    title: explicitTitle,
    subtitle: explicitSubtitle,
    bannerUrl: explicitBannerUrl,
    avatarUrl: explicitAvatarUrl,
  } = explicitProps;

  const safeProfile = profile ?? {};

  // institution_name in DB uses "LocalName / EnglishName" bilingual format
  const rawName = safeProfile.institution_name
    || safeProfile.institute_profile?.institution_name
    || safeProfile.institute_profile?.full_name
    || safeProfile.full_name
    || safeProfile.name
    || safeProfile.username
    || '';
  const { localName, englishName } = parseBilingualName(rawName);

  let defaultTitle = '';
  let defaultSubtitle = '';

  if (localName && englishName) {
    // Bilingual format: local name first, English second
    defaultTitle = capitalizeFirstLetter(localName);
    defaultSubtitle = capitalizeFirstLetter(englishName);
  } else if (localName || englishName) {
    defaultTitle = capitalizeFirstLetter(localName || englishName);
    defaultSubtitle = '';
  } else {
    defaultTitle = language === 'en' ? 'Institution' : 'संस्थान';
    defaultSubtitle = '';
  }

  const title = explicitTitle || defaultTitle;
  const subtitle = explicitSubtitle !== undefined ? explicitSubtitle : defaultSubtitle;
  const bannerUrl = explicitBannerUrl || safeProfile?.banner_url || '';
  const avatarUrl = explicitAvatarUrl || safeProfile?.profile_pic_url || '';

  return {
    title,
    subtitle,
    bannerUrl,
    avatarUrl
  };
}
