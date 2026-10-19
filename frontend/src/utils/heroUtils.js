import { capitalizeFirstLetter, getAcronym } from './stringUtils';

export function getHeroPropsFromProfile(profile, language, explicitProps = {}) {
  const {
    title: explicitTitle,
    subtitle: explicitSubtitle,
    bannerUrl: explicitBannerUrl,
    avatarUrl: explicitAvatarUrl,
  } = explicitProps;

  const safeProfile = profile ?? {};
  const rawName = safeProfile.full_name || safeProfile.institution_name || safeProfile.name || safeProfile.username || (language === 'en' ? 'Institution' : 'संस्थान');
  const title = explicitTitle || capitalizeFirstLetter(rawName);
  const subtitle = explicitSubtitle ?? safeProfile.nameLocal ?? safeProfile.nameHindi ?? (safeProfile.campus_type ? (language === 'en' ? `${safeProfile.campus_type} Campus` : `${safeProfile.campus_type} परिसर`) : "");
  const bannerUrl = explicitBannerUrl || safeProfile?.banner_url || '';
  const avatarUrl = explicitAvatarUrl || safeProfile?.profile_pic_url || '';

  return {
    title,
    subtitle,
    bannerUrl,
    avatarUrl
  };
}
