"""Discover local icon packs and write a static-host-compatible catalog."""
import json,re
from pathlib import Path
from urllib.parse import quote
ROOT=Path(__file__).resolve().parents[1]
def natural_key(value):
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r'(\d+)',value)]
def discover(root=ROOT):
    folder=Path(root)/'icons';packs=[]
    if not folder.exists():return {'version':1,'packs':[]}
    for pack in sorted(folder.iterdir(),key=lambda p:natural_key(p.name)):
        if not pack.is_dir() or pack.is_symlink() or pack.name.startswith('.'):continue
        images=[]
        for image in sorted(pack.iterdir(),key=lambda p:natural_key(p.name)):
            if image.is_file() and not image.is_symlink() and image.suffix.lower() in ('.svg','.png','.webp'):
                images.append('icons/'+quote(pack.name,safe='')+'/'+quote(image.name,safe=''))
        if images:packs.append({'id':pack.name,'name':pack.name,'images':images})
    return {'version':1,'packs':packs}
if __name__=='__main__':
    catalog=discover();(ROOT/'icons/catalog.json').write_text(json.dumps(catalog,indent=2)+'\n',encoding='utf-8')
    print(f"Catalog updated: {len(catalog['packs'])} icon packs.")
