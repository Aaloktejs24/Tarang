import re

filepath = "src/features/lms/CourseDetailsDashboard.jsx"
with open(filepath, 'r') as f:
    content = f.read()

start_marker = "{/* Rich Course Header */}"
end_marker = "{activeTab === 0 && ("

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    new_layout = """{loading ? (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4} lg={3}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 'var(--radius-lg)' }} />
            </Grid>
            <Grid item xs={12} md={8} lg={9}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 'var(--radius-lg)', mb: 4 }} />
              <Grid container spacing={3}>
                {[1, 2, 3].map(i => (
                  <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 'var(--radius-lg)' }} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={4} sx={{ flexGrow: 1, m: 0, width: '100%', mt: 2 }}>
            {/* Sidebar Content */}
            <Grid item xs={12} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'column', gap: 3, pl: '0 !important', pr: { xs: 0, md: 2 } }}>
              <PremiumCard sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {course?.image && (
                  <Box sx={{
                    width: '100%',
                    height: 160,
                    backgroundImage: `url(${course.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderBottom: 'var(--border-thin) solid var(--card-border)'
                  }} />
                )}
                
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 1, lineHeight: 1.2 }}>
                    {course?.title || (language === 'en' ? "Course Details" : "कोर्स विवरण")}
                  </Typography>
                  <Typography sx={{ color: 'var(--color-slate-600)', fontSize: 'var(--font-sm)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 3 }}>
                    {course?.desc || course?.description || (language === 'en' ? "Manage modules and students for this course." : "इस कोर्स के लिए मॉड्यूल और छात्रों का प्रबंधन करें।")}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {course?.category && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-700)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }}>
                        <CategoryOutlinedIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} /> {course.category}
                      </Box>
                    )}
                    {course?.language && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-700)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }}>
                        <LanguageOutlinedIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} /> {course.language}
                      </Box>
                    )}
                    {course?.level && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-700)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }}>
                        <SignalCellularAltOutlinedIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} /> {course.level}
                      </Box>
                    )}
                    {course?.duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-700)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} /> {course.duration}
                      </Box>
                    )}
                    {course?.price && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-700)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }}>
                        <AttachMoneyOutlinedIcon sx={{ fontSize: 18, color: 'var(--color-success)' }} /> 
                        <Box component="span" sx={{ color: course.price.toString().toLowerCase() === 'free' ? 'var(--color-success)' : 'inherit', fontWeight: 'var(--font-bold)' }}>
                          {course.price}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {course?.tags && course.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {course.tags.map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" sx={{ 
                          bgcolor: 'rgba(30, 79, 163, 0.08)', 
                          color: 'var(--color-primary)', 
                          fontWeight: 'var(--font-medium)',
                          fontSize: 'var(--font-xs)'
                        }} />
                      ))}
                    </Box>
                  )}

                  <TarangButton variant="primary" fullWidth startIcon={<AddOutlinedIcon />} onClick={() => showToast("Add Module functionality coming soon!", "info")}>
                    {language === 'en' ? "Add Module" : "मॉड्यूल जोड़ें"}
                  </TarangButton>
                </Box>
              </PremiumCard>
            </Grid>

            {/* Main Content Area */}
            <Grid item xs={12} md={8} lg={9} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{
                mb: 4,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: 'var(--border-thin) solid rgba(30, 79, 163, 0.2)',
                borderRadius: 'var(--radius-lg)',
                px: 2
              }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="course tabs"
                  TabIndicatorProps={{ sx: { bgcolor: 'var(--color-primary)', height: 3, borderRadius: '3px 3px 0 0' } }}
                >
                  <Tab
                    icon={<MenuBookOutlinedIcon />}
                    iconPosition="start"
                    label={t('Modules')}
                    sx={{ textTransform: 'none', fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', '&.Mui-selected': { color: 'var(--color-primary)' } }}
                  />
                  <Tab
                    icon={<PeopleOutlinedIcon />}
                    iconPosition="start"
                    label={t('Students Enrolled')}
                    sx={{ textTransform: 'none', fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', '&.Mui-selected': { color: 'var(--color-primary)' } }}
                  />
                </Tabs>
              </Box>

              """
              
    content = before + new_layout + after
    
    # We also need to close the Grid that wraps everything at the end
    content = content.replace("          </Box>\n        )}\n\n      </Container>", "          </Grid>\n        )}\n\n      </Container>")
    # If the last replace didn't work because of indentation, let's just do:
    content = content.replace("          </Box>\n        )}\n      </Container>", "          </Grid>\n        )}\n      </Container>")

    with open(filepath, 'w') as f:
        f.write(content)
    print("Updated layout to sidebar style.")
else:
    print("Could not find markers.")
