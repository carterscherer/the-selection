#!/usr/bin/env python3
"""Regenerate data.json from His.xlsx (export of the His Google Sheet)."""
import json,re,sys
from openpyxl import load_workbook
src=sys.argv[1] if len(sys.argv)>1 else 'His.xlsx'
wb=load_workbook(src)
out={}
for tab,key in [('Watches & Jewelry','watches'),('Products','wardrobe'),('Collections','collections')]:
    items=[]
    for r in wb[tab].iter_rows(min_row=2,values_only=True):
        if not r[1]: continue
        m=re.match(r'=IMAGE\("([^"]+)"',str(r[0] or ''))
        items.append({'name':r[1],'brand':r[2] or '','price':r[3] or '','link':r[4] or '','type':r[5] or '','image':m.group(1) if m else '','imageSource':r[6] or ''})
    out[key]=items
json.dump(out,open('data.json','w'),indent=1,ensure_ascii=False)
print({k:len(v) for k,v in out.items()})
