import CourseAccessDashboard from "../../../../../../features/lms/CourseAccessDashboard";

export default async function CourseAccessPage({ params }) {
  const { courseId } = await params;
  return <CourseAccessDashboard courseId={courseId} />;
}
