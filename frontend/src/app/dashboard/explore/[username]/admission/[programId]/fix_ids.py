import re

with open("page.jsx", "r") as f:
    content = f.read()

def process_section(section_content, prefix):
    # This function takes a section of code and adds fieldId="prefix_Label" to CustomFloating elements
    def repl(m):
        comp = m.group(1)
        attrs = m.group(2)
        # Extract label
        label_m = re.search(r'label="([^"]+)"', attrs)
        if not label_m:
            return m.group(0)
        label = label_m.group(1)
        
        # Avoid duplicate fieldId
        if 'fieldId=' in attrs:
            return m.group(0)
            
        field_id = f"{prefix}_{label}"
        return f"<{comp} fieldId=\"{field_id}\"{attrs}"
    
    return re.sub(r'<(CustomFloating(?:Input|Select|PhoneInput|DatePicker|CountrySelect|FileInput))\s+([^>]+/?>)', repl, section_content)

# We can manually apply process_section by finding the sections in page.jsx.
# 1. Personal Information
personal_start = content.find("Personal Information")
parents_start = content.find("PARENTS & GUARDIAN DETAILS")

personal_section = content[personal_start:parents_start]
new_personal = process_section(personal_section, "personal")
content = content[:personal_start] + new_personal + content[parents_start:]

# 2. Father
father_start = content.find("Father's Details")
mother_start = content.find("Mother's Details")
father_section = content[father_start:mother_start]
new_father = process_section(father_section, "parents_father")
content = content[:father_start] + new_father + content[mother_start:]

# 3. Mother
guardian_start = content.find("Guardian's Details")
mother_section = content[mother_start:guardian_start]
new_mother = process_section(mother_section, "parents_mother")
content = content[:mother_start] + new_mother + content[guardian_start:]

# 4. Guardian
sibling_start = content.find("Sibling Information")
guardian_section = content[guardian_start:sibling_start]
new_guardian = process_section(guardian_section, "parents_guardian")
content = content[:guardian_start] + new_guardian + content[sibling_start:]

# 5. Sibling
# Wait, Sibling is mapped. We need to handle index!
# In ApplicationReviewDrawer, Sibling ID is `sibling_0_Name`, but the drawer logic is:
# if (id.startsWith('sibling_')) return `Sibling ${parseInt(id.replace('sibling_', '')) + 1}`;
# Wait, drawer says `id.startsWith('sibling_')` and replaces it. But what about the specific field inside sibling?
# The drawer doesn't show sibling fields individually! It shows the whole sibling as a JSON string!
# Wait, let's look at ApplicationReviewDrawer.jsx for Sibling!
