import pathlib

def w(p, c):
    pathlib.Path(p).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(p).write_text(c, encoding='utf-8')
    print('wrote:', p)

S = r'd:\Final SIh\server'

