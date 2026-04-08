with open("app.js") as f:
    lines = f.readlines()
dom_idx = next(i for i,l in enumerate(lines) if "DOMContentLoaded" in l)
print("DOMContentLoaded en linea", dom_idx+1)
for l in lines[dom_idx:dom_idx+4]:
    print(" ", l.rstrip())
