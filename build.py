#!/usr/bin/env python3
"""Regenerate data.json from His.xlsx (export of the His Google Sheet).
Tabs: Garage (optional), Watches & Jewelry, Products, Collections, Places (optional)."""
import json,re,sys
from openpyxl import load_workbook
src=sys.argv[1] if len(sys.argv)>1 else 'His.xlsx'
wb=load_workbook(src)
def img(v):
    m=re.match(r'=IMAGE\("([^"]+)"',str(v or '')); return m.group(1) if m else ''
def rows(tab):
    if tab not in wb.sheetnames: return []
    ws=wb[tab]; hdr=[str(c.value or '').strip() for c in ws[1]]
    for r in ws.iter_rows(min_row=2,values_only=True):
        d=dict(zip(hdr,r))
        if d.get('Name') or d.get('name'): yield d
out={}
out['garage']=[{'name':d['Name'],'brand':d.get('Brand/store') or '','note':d.get('Note') or '','link':d.get('Link') or '','image':img(d.get('Thumbnail')),'colorMatch':d.get('Color match') or '','imagePage':d.get('Image page') or ''} for d in rows('Garage')]
for tab,key in [('Watches & Jewelry','watches'),('Products','wardrobe'),('Collections','collections')]:
    out[key]=[{'name':d['Name'],'brand':d.get('Brand/store') or '','price':d.get('Price') or '','link':d.get('Link') or '','type':d.get('Type') or '','image':img(d.get('Thumbnail')),'imageSource':d.get('Image source') or ''} for d in rows(tab)]
# places[] = {name, city, lat, lng, note, link, image}; add a 'Places' tab with those columns to populate
out['places']=[{'name':d.get('Name') or d.get('name'),'city':d.get('Location') or d.get('City') or '','lat':float(d['Lat']),'lng':float(d['Lng']),'note':d.get('Note') or '','link':d.get('Directions') or d.get('Link') or f"https://www.google.com/maps/dir/?api=1&destination={d['Lat']},{d['Lng']}",'image':img(d.get('Thumbnail'))} for d in rows('Places') if d.get('Lat') is not None]
B='https://carterscherer.github.io/the-selection/'
for k in ('garage','watches','wardrobe','collections'):
    for g in out[k]: g['image']=g['image'].replace(B,'')
json.dump(out,open('data.json','w'),indent=1,ensure_ascii=False,default=str)
print({k:len(v) for k,v in out.items()})
