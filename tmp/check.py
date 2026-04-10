import re
with open('chapters/chapter3/chapter3.tex', 'r') as f:
    content = f.read()
    print("Table matches:", re.findall(r'\\begin\{tabular\}.*?\\end\{tabular\}', content, re.DOTALL)[:2])
