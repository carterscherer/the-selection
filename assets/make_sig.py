from PIL import Image
import numpy as np, potrace
A='/home/box/agent-data/agents/f8e3450f-8e41-4ae1-86bf-c723abdab5ea/attachments/15147843368482afa6ebc3dea33732db974eec8f73fa627eb8a49e3282a340b5.png'
im=np.array(Image.open(A).convert('RGBA'))
lum=im[...,:3].mean(2); alpha=(im[...,3]*(1-lum/255)).astype('uint8')
ys,xs=np.where(alpha>40); x0,y0,x1,y1=xs.min()-20,ys.min()-20,xs.max()+20,ys.max()+20
alpha=alpha[y0:y1,x0:x1]; H,W=alpha.shape
for n,c in [('navy',(28,42,68)),('cream',(246,241,231)),('black',(0,0,0))]:
    o=np.zeros((H,W,4),'uint8'); o[...,:3]=c; o[...,3]=alpha; Image.fromarray(o).save(f'signature-{n}.png')
p=potrace.Bitmap(~(alpha>110)).trace(turdsize=15,opttolerance=0.5)
d=[]
for cv in p.curves:
    s=cv.start_point; seg=[f"M{s.x:.1f},{s.y:.1f}"]
    for x in cv.segments:
        if x.is_corner: seg.append(f"L{x.c.x:.1f},{x.c.y:.1f}L{x.end_point.x:.1f},{x.end_point.y:.1f}")
        else: seg.append(f"C{x.c1.x:.1f},{x.c1.y:.1f} {x.c2.x:.1f},{x.c2.y:.1f} {x.end_point.x:.1f},{x.end_point.y:.1f}")
    d.append(''.join(seg)+'Z')
D=' '.join(d); open('signature.path','w').write(D); open('signature.viewbox','w').write(f'0 0 {W} {H}')
for n,c in [('navy','#1c2a44'),('cream','#f6f1e7')]:
    open(f'signature-{n}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><path fill="{c}" fill-rule="evenodd" d="{D}"/></svg>')
fav=Image.open('signature-navy.png'); sz=max(fav.size); bg=Image.new('RGBA',(sz,sz),(246,241,231,255)); bg.paste(fav,((sz-W)//2,(sz-H)//2),fav)
bg.resize((256,256),Image.LANCZOS).save('favicon.png')
open('favicon.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-(sz-W)//2} {-(sz-H)//2} {sz} {sz}"><rect x="{-(sz-W)//2}" y="{-(sz-H)//2}" width="{sz}" height="{sz}" rx="{sz//8}" fill="#f6f1e7"/><path fill="#1c2a44" d="{D}"/></svg>')
print(len(p.curves),len(D),W,H)
