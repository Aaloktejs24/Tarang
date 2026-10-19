import re

with open("page.jsx", "r") as f:
    content = f.read()

# I will add FieldContext import and the provider.
import_stmt = "import { FieldContext } from '../../../../../../contexts/FieldContext';\n"
if "FieldContext" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\n" + import_stmt)

context_values = """
  const enabledLabels = React.useMemo(() => {
    if (application?.status !== 'rejected') return null;
    if (!requestedFields) return [];
    const labels = [];
    Object.keys(requestedFields).forEach(key => {
       if (requestedFields[key]) {
          if (key.startsWith('sibling_')) {
             labels.push('Name', 'Relation', 'Profession', 'Income', 'Location', 'Income Proof', 'Relation Proof');
          } else if (key.startsWith('academic_')) {
             labels.push('Qualification', 'Passing Year', 'Percentage / CGPA', 'Academic Document');
          } else if (key.startsWith('criminal_')) {
             labels.push('Type', 'Punishment', 'Date');
          } else {
             const parts = key.split('_');
             labels.push(parts[parts.length - 1]);
          }
       }
    });
    return labels;
  }, [application?.status, requestedFields]);

  const commentsByLabel = React.useMemo(() => {
     if (application?.status !== 'rejected') return {};
     const map = {};
     Object.keys(fieldComments).forEach(key => {
        if (fieldComments[key]) {
            if (key.startsWith('sibling_')) {
                ['Name', 'Relation', 'Profession', 'Income', 'Location', 'Income Proof', 'Relation Proof'].forEach(l => map[l] = fieldComments[key]);
            } else if (key.startsWith('academic_')) {
                ['Qualification', 'Passing Year', 'Percentage / CGPA', 'Academic Document'].forEach(l => map[l] = fieldComments[key]);
            } else if (key.startsWith('criminal_')) {
                ['Type', 'Punishment', 'Date'].forEach(l => map[l] = fieldComments[key]);
            } else {
                const parts = key.split('_');
                map[parts[parts.length - 1]] = fieldComments[key];
            }
        }
     });
     return map;
  }, [application?.status, fieldComments]);
"""

if "enabledLabels =" not in content:
    content = content.replace("const isFieldDisabled = React.useCallback", context_values + "\n  const isFieldDisabled = React.useCallback")

provider_start = "<FieldContext.Provider value={{ isRejected: application?.status === 'rejected', enabledLabels, commentsByLabel }}>"
provider_end = "</FieldContext.Provider>"

if provider_start not in content:
    content = content.replace("{activeStep === 0 && renderBasicDetailsForm()}", f"{provider_start}\n            {{activeStep === 0 && renderBasicDetailsForm()}}\n            {provider_end}")

with open("page.jsx", "w") as f:
    f.write(content)

