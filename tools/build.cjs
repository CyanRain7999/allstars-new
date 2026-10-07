'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const roots=['index.html','style.css','theme.css','campaign.js','data.js','progress.js','combat-data.js','engine.js','animation.js','weapons.js','field.js','scenes.js','pwa.js','app.js','manifest.webmanifest','sw.js','.nojekyll'];
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}
const files=[...roots,...walk('assets'),...walk('vendor')].filter(f=>!f.endsWith('.md')&&!f.endsWith('sources.json')&&f!=='sw.js'&&f!=='.nojekyll').sort();
for(const f of [...roots,...files])if(!fs.existsSync(path.join(root,f)))throw Error('Missing '+f);
const hash=crypto.createHash('sha256');for(const f of [...files,'sw.js']){hash.update(f);hash.update(fs.readFileSync(path.join(root,f)));}const version=hash.digest('hex').slice(0,16);
fs.writeFileSync(path.join(root,'precache-manifest.js'),'self.ALLSTARS_PRECACHE='+JSON.stringify({version,files})+';\n');
// Only this generated folder is removed, and only after checking its target.
if(path.dirname(dist)!==root||path.basename(dist)!=='dist')throw Error('Unsafe output path');
if(fs.existsSync(dist))fs.rmSync(dist,{recursive:true});fs.mkdirSync(dist);
for(const f of [...new Set([...roots,...files,'precache-manifest.js'])]){const dest=path.join(dist,f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,f),dest);}
console.log('Built',files.length,'offline files; version',version,'→ dist/');
