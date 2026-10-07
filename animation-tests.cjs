'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const D=require('./data.js'),data=require('./assets/animations/data.js'),{Library}=require('./animation.js');
const lib=new Library(data);let moving=0,actions=0;
function pose(a){return JSON.stringify(a.armature.getSlots().map(s=>[s.displayIndex,s._colorTransform.alphaMultiplier,...Object.values(s.globalTransformMatrix)]));}
assert.equal(D.plants.length,36);assert.equal(Object.keys(data).length,36);
for(const p of D.plants){
  const e=data[p.id];assert(e&&fs.existsSync(e.texture),'缺少原生贴图 '+p.id);
  lib.add(p.id,{width:e.atlas.width,height:e.atlas.height});const a=lib.create(p.id);
  assert(a&&a.names.some(n=>n.startsWith('Idle')),'缺少待机动画 '+p.id);
  assert(a.box.width>1&&a.box.height>1&&a.box.width/a.box.height<6,'角色缩放异常 '+p.id);
  const before=pose(a);a.update(.37);if(pose(a)!==before)moving++;
  for(const mode of ['attack','heal','skill']){
    a.act(mode);for(let i=0;i<48;i++){a.update(1/30);for(const slot of a.armature.getSlots())assert(Object.values(slot.globalTransformMatrix).every(Number.isFinite),'动画产生无效矩阵 '+p.id);}
    if(a.mode!=='idle')actions++;
    for(let i=0;i<180;i++)a.update(1/30);
  }
  a.act('death');a.update(.2);a.dispose();lib.flush();
}
assert(moving>=32,'原生待机应包含独立骨骼运动');
console.log('PASS 36 种原生动画、所有动作矩阵、贴图文件与角色缩放；待机变化 '+moving+' / 36');
