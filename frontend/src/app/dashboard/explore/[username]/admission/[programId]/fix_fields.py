import re

with open("page.jsx", "r") as f:
    content = f.read()

# Replace <CustomFloatingInput label="X" ...> with <FieldWrapper id="section_X"><CustomFloating...></FieldWrapper>
# Since there are multiple CustomFloating variants:
comp_regex = r'(<(CustomFloating(?:Input|Select|PhoneInput|DatePicker|CountrySelect|FileInput))\s+([^>]+)(/?>))'
# Wait, some tags are not self closing, e.g. <CustomFloatingInput ...> ... </CustomFloatingInput>.
# CustomFloatingFields components are generally self-closing or they just have empty content.

# The easiest and most reliable way:
# Let's just create a modified page.jsx by doing replace() on the specific lines we know.

