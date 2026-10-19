filepath = "src/features/lms/CourseDetailsDashboard.jsx"
with open(filepath, 'r') as f:
    content = f.read()

target = """              </Box>
            )}
          </Grid>
        )}
      </Container>
    </Box>"""

replace = """              </Box>
            )}
          </Grid>
          </Grid>
        )}
      </Container>
    </Box>"""

content = content.replace(target, replace)

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed JSX syntax.")
