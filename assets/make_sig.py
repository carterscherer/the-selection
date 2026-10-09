# Signature assets from Carter's pencil signature (digitized by /workspace/signatures/final/digitize.py)
import re
from PIL import Image
D=open('signature.path').read().strip(); VB=open('signature.viewbox').read().strip(); _,_,W,H=map(int,VB.split())
fav=Image.open('signature-navy.png'); w,h=fav.size; sz=int(w*1.05); bg=Image.new('RGBA',(sz,sz),(246,241,231,255)); bg.paste(fav,((sz-w)//2,(sz-h)//2),fav)
bg.resize((256,256),Image.LANCZOS).save('favicon.png')
s=int(W*1.05); o=(s-W)//2; oy=(s-H)//2
open('favicon.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-o} {-oy} {s} {s}"><rect x="{-o}" y="{-oy}" width="{s}" height="{s}" rx="{s//8}" fill="#f6f1e7"/><path fill="#1c2a44" fill-rule="evenodd" d="{D}"/></svg>')
p='../index.html'; t=open(p).read()
t,n=re.subn(r'<symbol id="sig" viewBox="[^"]*"><path fill-rule="evenodd" d="[^"]*"',f'<symbol id="sig" viewBox="{VB}"><path fill-rule="evenodd" d="{D}"',t)
assert n==1; open(p,'w').write(t); print('ok',VB)
