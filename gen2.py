import json, pathlib

def w(p, c):
    pathlib.Path(p).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(p).write_text(c, encoding='utf-8')
    print('wrote:', p)

S = r'd:\Final SIh\server'
C = r'd:\Final SIh\client\src'
B = r'd:\Final SIh'
