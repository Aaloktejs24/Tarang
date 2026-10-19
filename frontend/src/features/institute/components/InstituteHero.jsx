"use client";

import React from 'react';
import UniversalHero from '../../../components/hero/UniversalHero';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { capitalizeFirstLetter, getAcronym } from '../../../utils/stringUtils';

export default function InstituteHero(props) {
  const {
    title: explicitTitle,
    subtitle: explicitSubtitle,
    bannerUrl: explicitBannerUrl,
    avatarUrl: explicitAvatarUrl,
  } = props;

  const profile = props.profile ?? {};
  const { language } = useAccessibility();
  const rawName = profile.institution_name || profile.full_name || profile.name || profile.username || (language === 'en' ? 'Institution' : 'संस्थान');
  const title = explicitTitle || capitalizeFirstLetter(rawName);
  const subtitle = explicitSubtitle ?? profile.nameLocal ?? profile.nameHindi ?? (profile.campus_type ? (language === 'en' ? `${profile.campus_type} Campus` : `${profile.campus_type} परिसर`) : "");
  const banner = explicitBannerUrl || profile?.banner_url || '';
  const avatar = explicitAvatarUrl || profile?.profile_pic_url || '';

  // Extract breadcrumbs from props to prevent passing it down to UniversalHero
  const { breadcrumbs, ...restProps } = props;

  return (
    <UniversalHero
      {...restProps}
      title={title}
      subtitle={subtitle}
      bannerUrl={banner}
      avatarUrl={avatar}
    />
  );
}
