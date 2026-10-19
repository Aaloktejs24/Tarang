import re

with open("page.jsx", "r") as f:
    content = f.read()

# We need to add requestedFields and fieldComments logic
state_hooks_code = """
  const { requestedFields, fieldComments } = React.useMemo(() => {
    if (application?.status !== 'rejected') return { requestedFields: null, fieldComments: {} };
    if (!application?.metadata) return { requestedFields: null, fieldComments: {} };
    try {
      const meta = typeof application.metadata === 'string' ? JSON.parse(application.metadata) : application.metadata;
      return {
        requestedFields: meta.selectedFields || null,
        fieldComments: meta.fieldComments || {}
      };
    } catch (e) {
      return { requestedFields: null, fieldComments: {} };
    }
  }, [application]);

  const isFieldDisabled = React.useCallback((id) => {
    if (application?.status !== 'rejected') return false;
    if (!requestedFields) return false;
    return !requestedFields[id];
  }, [application?.status, requestedFields]);

  const FieldWrapper = React.useCallback(({ id, children }) => {
    const disabled = isFieldDisabled(id);
    const comment = fieldComments[id];
    
    if (application?.status !== 'rejected') return children;
    
    return (
      <Box sx={{ 
        opacity: disabled ? 0.6 : 1, 
        pointerEvents: disabled ? 'none' : 'auto',
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        {children}
        {!disabled && comment && (
          <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
            <InfoOutlinedIcon sx={{ fontSize: '14px' }} />
            {comment}
          </Typography>
        )}
      </Box>
    );
  }, [isFieldDisabled, fieldComments, application?.status]);
"""

# Insert state hooks
content = content.replace("const [basicDetailsErrors, setBasicDetailsErrors] = useState({});", "const [basicDetailsErrors, setBasicDetailsErrors] = useState({});\n" + state_hooks_code)

# We have to wrap fields. It's safer to use regex to wrap the <CustomFloatingInput ... /> etc.
# But it's hard to match JSX reliably.
# Let's replace the elements manually where needed.

# Instead of modifying every field, what if we use the same Box approach but intercept the fields?
# Let's save the file back for now so we can test the state hooks insertion
with open("page.jsx", "w") as f:
    f.write(content)
