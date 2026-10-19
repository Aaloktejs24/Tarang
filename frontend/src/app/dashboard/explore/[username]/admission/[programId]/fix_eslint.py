import re

with open("../../../../../../components/common/CustomFloatingFields.jsx", "r") as f:
    content = f.read()

# The HOC is returning an anonymous component: React.forwardRef((props, ref) => ...)
# We should give it a name: React.forwardRef(function WithFieldState(props, ref) { ... })

hoc_code_old = "const withFieldState = (WrappedComponent) => React.forwardRef((props, ref) => {"
hoc_code_new = "const withFieldState = (WrappedComponent) => React.forwardRef(function WithFieldState(props, ref) {"

content = content.replace(hoc_code_old, hoc_code_new)

with open("../../../../../../components/common/CustomFloatingFields.jsx", "w") as f:
    f.write(content)
