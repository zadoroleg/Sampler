const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'Samples');
const sort=(a,b)=>a.localeCompare(b,'ru',{numeric:true,sensitivity:'base'});
const preferred=['Teatr','Taxi','Restoran'];
const labels={Teatr:'Театр',Taxi:'Такси',Restoran:'Ресторан'};
const scenes=fs.readdirSync(root,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>{
 const files=fs.readdirSync(path.join(root,x.name)).filter(f=>/\.(mp3|wav|ogg|m4a|flac)$/i.test(f)).sort(sort);
 const bgm=files.filter(f=>/bgm/i.test(f));
 if(bgm.length!==1)throw Error(`${x.name}: expected exactly one BGM file`);
 const asset=name=>({name,url:`Samples/${encodeURIComponent(x.name)}/${encodeURIComponent(name)}?v=${crypto.createHash('sha256').update(fs.readFileSync(path.join(root,x.name,name))).digest('hex').slice(0,12)}`});
 return {folder:x.name,name:labels[x.name]||x.name,bgm:asset(bgm[0]),samples:files.filter(f=>!/bgm/i.test(f)).map(asset)};
}).sort((a,b)=>{
 const rank=name=>{const i=preferred.indexOf(name);return i<0?preferred.length:i};
 return rank(a.folder)-rank(b.folder)||sort(a.name,b.name);
});
fs.writeFileSync(path.join(__dirname,'scenes.json'),JSON.stringify(scenes,null,2)+'\n');
console.log(scenes.map(s=>`${s.name}: ${s.bgm.name}; ${s.samples.map(x=>x.name).join(', ')}`).join('\n'));
