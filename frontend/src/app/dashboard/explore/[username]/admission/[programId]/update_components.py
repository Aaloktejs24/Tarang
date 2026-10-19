import re

with open("../../../../../../components/common/CustomFloatingFields.jsx", "r") as f:
    content = f.read()

import_stmt = "import { FieldContext } from '../../contexts/FieldContext';\nimport InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';\n"
if "FieldContext" not in content:
    content = content.replace("import { Box, Typography } from '@mui/material';", "import { Box, Typography } from '@mui/material';\n" + import_stmt)

def inject_context(comp_code):
    # Find the start of the component body
    body_start = comp_code.find("{") + 1
    
    # We want to inject:
    injection = """
  const fieldContext = React.useContext(FieldContext);
  let finalDisabled = disabled;
  let comment = null;
  if (fieldContext && fieldContext.isRejected && fieldContext.enabledLabels) {
     finalDisabled = !fieldContext.enabledLabels.includes(label);
     if (!finalDisabled) {
         comment = fieldContext.commentsByLabel[label];
     }
  }
"""
    # And then we need to replace `disabled` with `finalDisabled` inside the return statement.
    # Also add the comment Typography.
    # It's easier to just use a wrapper inside CustomFloatingFields.jsx for all exported components.
    return comp_code

# Instead of modifying the internals of 6 different complex components,
# Let's write a generic Higher Order Component (HOC) in CustomFloatingFields.jsx
hoc_code = """
const withFieldState = (WrappedComponent) => React.forwardRef((props, ref) => {
  const fieldContext = React.useContext(FieldContext);
  let finalDisabled = props.disabled;
  let comment = null;
  
  if (fieldContext && fieldContext.isRejected && fieldContext.enabledLabels) {
     finalDisabled = !fieldContext.enabledLabels.includes(props.label);
     if (!finalDisabled && fieldContext.commentsByLabel) {
         comment = fieldContext.commentsByLabel[props.label];
     }
  }

  const content = <WrappedComponent {...props} disabled={finalDisabled} ref={ref} />;
  
  if (!comment) return content;
  
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {content}
      <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500, position: 'absolute', bottom: '-20px', left: 0 }}>
        <InfoOutlinedIcon sx={{ fontSize: '14px' }} />
        {comment}
      </Typography>
    </Box>
  );
});
"""
# wait, if I use an HOC, I can just export the wrapped components instead of the raw ones!
# Original exports: `export const CustomFloatingInput = React.forwardRef(...)`
# New exports: 
# `const BaseCustomFloatingInput = React.forwardRef(...)`
# `export const CustomFloatingInput = withFieldState(BaseCustomFloatingInput);`

