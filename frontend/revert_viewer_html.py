import re

with open('public/pdfjs/web/viewer.html', 'r') as f:
    content = f.read()

# 1. Extract zoom controls from left
zoom_regex = re.compile(r'(<div class="verticalToolbarSeparator hiddenSmallView" style="margin: 0 8px;"></div>\s*<div class="splitToolbarButton">\s*<button id="zoomOut".*?</select>\s*</span>)', re.DOTALL)
match = zoom_regex.search(content)
if match:
    zoom_controls = match.group(1)
    # Remove from left
    content = content.replace(zoom_controls, '')
    
    # 2. Put back into middle, before custom-pdf-title
    middle_target = r'(<div id="toolbarViewerMiddle">\s*)'
    # We will strip the vertical separator since PDF.js didn't have it natively in middle, but actually we WANT the separator!
    # Let's keep it.
    replacement = r'\g<1>' + zoom_controls.replace('\\', '\\\\') + r'\n                '
    content = re.sub(middle_target, replacement, content)

with open('public/pdfjs/web/viewer.html', 'w') as f:
    f.write(content)
