import os
import re

directory = '/Users/aaloktejas/Development/Tarang/frontend/src'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace var(--color-slate-700) -> var(--color-slate-900)
            new_content = re.sub(r'var\(--color-slate-700\)', 'var(--color-slate-900)', content)
            
            # Replace var(--color-slate-400) -> var(--color-slate-500)
            new_content = re.sub(r'var\(--color-slate-400\)', 'var(--color-slate-500)', new_content)

            # Replace any stray color-slate-600 or 800 just in case
            new_content = re.sub(r'var\(--color-slate-600\)', 'var(--color-slate-500)', new_content)
            new_content = re.sub(r'var\(--color-slate-800\)', 'var(--color-slate-900)', new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
