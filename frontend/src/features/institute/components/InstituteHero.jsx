"use client";

import React from 'react';
import UniversalHero from '../../../components/hero/UniversalHero';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getHeroPropsFromProfile } from '../../../utils/heroUtils';

export default function InstituteHero(props) {
  const {
    title: explicitTitle,
    subtitle: explicitSubtitle,
    bannerUrl: explicitBannerUrl,
    avatarUrl: explicitAvatarUrl,
  } = props;

  const profile = props.profile ?? {};
  const { language } = useAccessibility();

  const { title, subtitle, bannerUrl, avatarUrl } = getHeroPropsFromProfile(profile, language, {
    title: explicitTitle,
    subtitle: explicitSubtitle,
    bannerUrl: explicitBannerUrl,
    avatarUrl: explicitAvatarUrl,
  });

  // Extract breadcrumbs from props to prevent passing it down to UniversalHero
  const { breadcrumbs, ...restProps } = props;

  return (
    <UniversalHero
      {...restProps}
      title={title}
      subtitle={subtitle}
      bannerUrl={bannerUrl}
      avatarUrl={avatarUrl}
    />
  );
}
