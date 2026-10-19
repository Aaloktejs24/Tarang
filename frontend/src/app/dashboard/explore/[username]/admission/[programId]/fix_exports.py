import re

with open("../../../../../../components/common/CustomFloatingFields.jsx", "r") as f:
    content = f.read()

# Replace export const CustomFloatingX = withFieldState(...)
# with const WrappedCustomFloatingX = withFieldState(...)
# and export { WrappedCustomFloatingX as CustomFloatingX }

replacements = [
    "Input", "Select", "PhoneInput", "DatePicker", "CountrySelect", "FileInput"
]

export_lines = []
for name in replacements:
    old_line = f"export const CustomFloating{name} = withFieldState(BaseCustomFloating{name});"
    new_line = f"const WrappedCustomFloating{name} = withFieldState(BaseCustomFloating{name});"
    content = content.replace(old_line, new_line)
    export_lines.append(f"export {{ WrappedCustomFloating{name} as CustomFloating{name} }};")

# Also fix the displayName
content = content.replace('CustomFloatingInput.displayName = "CustomFloatingInput";', 'WrappedCustomFloatingInput.displayName = "CustomFloatingInput";')
content = content.replace('CustomFloatingFileInput.displayName = "CustomFloatingFileInput";', 'WrappedCustomFloatingFileInput.displayName = "CustomFloatingFileInput";')

# Append the exports
content += "\n" + "\n".join(export_lines) + "\n"

with open("../../../../../../components/common/CustomFloatingFields.jsx", "w") as f:
    f.write(content)
