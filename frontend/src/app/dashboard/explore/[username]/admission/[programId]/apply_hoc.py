import re

with open("../../../../../../components/common/CustomFloatingFields.jsx", "r") as f:
    content = f.read()

if "withFieldState" in content:
    print("Already applied")
    exit(0)

import_stmt = "import { FieldContext } from '../../contexts/FieldContext';\nimport InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';\n"
content = content.replace("import { Box, Typography } from '@mui/material';", "import { Box, Typography } from '@mui/material';\n" + import_stmt)

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
    <Box sx={{ position: 'relative', width: '100%', mb: 3 }}>
      {content}
      <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500, position: 'absolute', bottom: '-20px', left: 0 }}>
        <InfoOutlinedIcon sx={{ fontSize: '14px' }} />
        {comment}
      </Typography>
    </Box>
  );
});

"""

# Insert HOC at the top
content = content.replace("export const CustomFloatingInput = ", hoc_code + "const BaseCustomFloatingInput = ")
content = content.replace("export const CustomFloatingSelect = ", "const BaseCustomFloatingSelect = ")
content = content.replace("export const CustomFloatingPhoneInput = ", "const BaseCustomFloatingPhoneInput = ")
content = content.replace("export const CustomFloatingDatePicker = ", "const BaseCustomFloatingDatePicker = ")
content = content.replace("export const CustomFloatingCountrySelect = ", "const BaseCustomFloatingCountrySelect = ")
content = content.replace("export const CustomFloatingFileInput = ", "const BaseCustomFloatingFileInput = ")

# Add exports at the bottom
exports_code = """
export const CustomFloatingInput = withFieldState(BaseCustomFloatingInput);
export const CustomFloatingSelect = withFieldState(BaseCustomFloatingSelect);
export const CustomFloatingPhoneInput = withFieldState(BaseCustomFloatingPhoneInput);
export const CustomFloatingDatePicker = withFieldState(BaseCustomFloatingDatePicker);
export const CustomFloatingCountrySelect = withFieldState(BaseCustomFloatingCountrySelect);
export const CustomFloatingFileInput = withFieldState(BaseCustomFloatingFileInput);
"""

content += "\n" + exports_code

with open("../../../../../../components/common/CustomFloatingFields.jsx", "w") as f:
    f.write(content)

print("Applied HOC successfully")
