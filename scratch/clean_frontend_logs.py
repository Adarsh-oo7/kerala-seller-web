import os
import re

def remove_non_ascii(text):
    return text.encode('ascii', 'ignore').decode('ascii')

# Regex for console logs: console.log(...), console.error(...), etc.
console_regex = re.compile(r'(console\.(log|error|warn|info|debug)\s*\()(.*?)(\))', re.DOTALL)

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='iso-8859-1') as f:
            content = f.read()
    
    new_content = content
    
    def replace_match(match):
        prefix = match.group(1)
        args = match.group(3)
        suffix = match.group(4)
        
        # Remove non-ASCII from args
        clean_args = remove_non_ascii(args)
        # Replace common symbols
        clean_args = clean_args.replace('→', '->').replace('✓', 'OK').replace('✔', 'OK')
        
        return f"{prefix}{clean_args}{suffix}"

    new_content = console_regex.sub(replace_match, content)
    
    if new_content != content:
        print(f"Cleaned {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

def walk_and_clean(root_dir):
    for root, dirs, files in os.walk(root_dir):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.next' in dirs: dirs.remove('.next')
        
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    base_dir = r'c:\Users\adars\Desktop\kerala sellers\web_frontend'
    walk_and_clean(base_dir)
