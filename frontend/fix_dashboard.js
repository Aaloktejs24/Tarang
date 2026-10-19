const fs = require('fs');
const file = 'src/features/lms/CourseDetailsDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add actualStudents state
content = content.replace(
  /const \[course, setCourse\] = useState\(null\);/,
  `const [course, setCourse] = useState(null);\n  const [actualStudents, setActualStudents] = useState([]);`
);

// Fetch actualStudents if management
content = content.replace(
  /if \(profile\?\.id \&\& \!isManagement\) {/g,
  `if (isManagement) {\n          const studentsRes = await lmsService.getCourseStudents(courseId);\n          if (studentsRes) setActualStudents(studentsRes);\n        }\n        if (profile?.id && !isManagement) {`
);

// Update AvatarGroup to use actualStudents
const oldAvatarGroup = `                        {course.students > 4 ? (
                          <AvatarGroup max={5} total={course.students} sx={{ '& .MuiAvatar-root': { width: 56, height: 56, fontSize: '1.25rem', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Avatar key={i} sx={{ bgcolor: \`hsl(\${(i * 70 + 200) % 360}, 70%, 55%)\` }}>
                                <PersonIcon sx={{ fontSize: 32 }} />
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        ) : (
                          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 56, height: 56, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                            {Array.from({ length: course.students }).map((_, i) => (
                              <Avatar key={i} sx={{ bgcolor: \`hsl(\${(i * 70 + 200) % 360}, 70%, 55%)\` }}>
                                <PersonIcon sx={{ fontSize: 32 }} />
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        )}`;

const newAvatarGroup = `                        <AvatarGroup max={5} total={course.students} sx={{ '& .MuiAvatar-root': { width: 56, height: 56, fontSize: '1.25rem', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                          {actualStudents.length > 0 ? actualStudents.map((s, i) => (
                            <Tooltip title={s.name || s.email || 'Student'} key={s.id || i}>
                              <Avatar sx={{ bgcolor: \`hsl(\${(i * 70 + 200) % 360}, 70%, 55%)\` }}>
                                {s.name ? s.name.substring(0, 1).toUpperCase() : <PersonIcon sx={{ fontSize: 32 }} />}
                              </Avatar>
                            </Tooltip>
                          )) : Array.from({ length: Math.min(course.students, 4) }).map((_, i) => (
                            <Avatar key={i} sx={{ bgcolor: \`hsl(\${(i * 70 + 200) % 360}, 70%, 55%)\` }}>
                              <PersonIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                          ))}
                        </AvatarGroup>`;

content = content.replace(oldAvatarGroup, newAvatarGroup);
fs.writeFileSync(file, content, 'utf8');
