import os
import re

def fix_grid(content):
    def replace_func(match):
        attrs = match.group(1)
        attrs = re.sub(r'\bitem\b', '', attrs)
        breakpoints = {}
        for bp in ['xs', 'sm', 'md', 'lg', 'xl']:
            bp_match = re.search(r'\b' + bp + r'=(\{[^}]+\}|"[^"]+"|[^>\s]+)', attrs)
            if bp_match:
                val = bp_match.group(1)
                if val.startswith('{') and val.endswith('}'):
                    val = val[1:-1]
                breakpoints[bp] = val
                attrs = attrs[:bp_match.start()] + attrs[bp_match.end():]
        
        if breakpoints:
            size_str = "size={{" + ", ".join([f"{k}: {v}" for k, v in breakpoints.items()]) + "}}"
            attrs += " " + size_str
            
        attrs = re.sub(r'\s+', ' ', attrs).strip()
        if attrs:
            return f"<Grid {attrs}"
        else:
            return "<Grid"
            
    return re.sub(r'<Grid\s+item\b([^>]*)', replace_func, content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            new_content = fix_grid(content)
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {path}")
