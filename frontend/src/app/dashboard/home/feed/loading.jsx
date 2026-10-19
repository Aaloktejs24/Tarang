"use client";
import React from 'react';
import FeedSkeleton from '../../../../features/feed/FeedSkeleton';

export default function FeedLoading() {
  return <FeedSkeleton count={6} />;
}
