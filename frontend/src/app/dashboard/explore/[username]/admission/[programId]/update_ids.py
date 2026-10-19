import re

with open("page.jsx", "r") as f:
    content = f.read()

# We can replace <CustomFloatingInput label="Full Name" ... with <CustomFloatingInput fieldId="personal_Full Name" label="Full Name" ...
replacements = {
    r'label="Full Name"': 'fieldId="personal_Full Name" label="Full Name"',
    r'label="Email"': 'fieldId="personal_Email" label="Email"',
    r'label="Phone Number"': 'fieldId="personal_Phone" label="Phone Number"',
    r'label="Date of Birth"': 'fieldId="personal_DOB" label="Date of Birth"',
    r'label="Nationality"': 'fieldId="personal_Nationality" label="Nationality"',
    r'label="Gender"': 'fieldId="personal_Gender" label="Gender"',
    r'label="Caste"': 'fieldId="personal_Caste" label="Caste"',
    r'label="Sub-caste"': 'fieldId="personal_Sub-caste" label="Sub-caste"',
    r'label="Birth Religion"': 'fieldId="personal_Birth Religion" label="Birth Religion"',
    r'label="Current Religion"': 'fieldId="personal_Current Religion" label="Current Religion"',
    r'label="Race/Ethnicity"': 'fieldId="personal_Race/Ethnicity" label="Race/Ethnicity"',
    r'label="Language"': 'fieldId="personal_Language" label="Language"',
}

# The problem is that "Name" is used for Father, Mother, Guardian, Sibling.
# So simple replacement won't work perfectly.

