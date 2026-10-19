import CourseAccessDashboard from "../../../../../../features/lms/CourseAccessDashboard";

export default function CourseAccessPage({ params }) {
  const { courseId } = params;
  return <CourseAccessDashboard courseId={courseId} />;
}
