import re

with open('public/pdfjs/web/viewer.html', 'r') as f:
    content = f.read()

zoom_controls_regex = re.compile(r'(<div class="splitToolbarButton">\s*<button id="zoomOut".*?</select>\s*</span>)', re.DOTALL)
match = zoom_controls_regex.search(content)
zoom_controls = match.group(1)

content = content.replace(zoom_controls, '')

insertion_point = r'(<span id="numPages" class="toolbarLabel"></span>\s*</div>)'
replacement = r'<span id="numPages" class="toolbarLabel"></span>\n                <div class="verticalToolbarSeparator hiddenSmallView" style="margin: 0 8px;"></div>\n                ' + zoom_controls.replace('\\', '\\\\') + r'\n              </div>'
content = re.sub(insertion_point, replacement, content)

middle_regex = re.compile(r'(<div id="toolbarViewerMiddle">\s*)</div>', re.DOTALL)
content = re.sub(middle_regex, r'\g<1><div id="custom-pdf-title" class="hiddenSmallView" style="display: flex; align-items: center; justify-content: center; height: 32px; padding: 0 4px; width: 100%;"><span style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;"></span></div></div>', content)

download_btn = r'''<button id="custom-download-original" class="toolbarButton" title="Download Original File" tabindex="33" style="display: none;">
                  <span data-l10n-id="download_original_label">Original File</span>
                </button>'''

content = content.replace('<button id="download"', download_btn + '\n                <button id="download"')

with open('public/pdfjs/web/viewer.html', 'w') as f:
    f.write(content)
