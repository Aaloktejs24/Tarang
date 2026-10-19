"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import CourseDetailsDashboard from '../../../../../../features/lms/CourseDetailsDashboard';

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId;

  return <CourseDetailsDashboard courseId={courseId} />;
}
