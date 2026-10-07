(function(root){
  'use strict';
  const db=typeof module!=='undefined'&&module.exports?require('./vendor/dragonbones-core.js'):root.dragonBones;
  class CanvasTexture extends db.TextureData {static toString(){return '[class CanvasTexture]';}}
  class CanvasAtlas extends db.TextureAtlasData {
    static toString(){return '[class CanvasAtlas]';}
    createTexture(){return db.BaseObject.borrowObject(CanvasTexture);}
    _onClear(){super._onClear();this.image=null;}
  }
  // DragonBones computes bone inheritance, z order, image swaps and deformation.
  // This adapter draws its evaluated slots on the game's existing Canvas.
  class CanvasSlot extends db.Slot {
    static toString(){return '[class CanvasSlot]';}
    _initDisplay(){} _disposeDisplay(){} _onUpdateDisplay(){}
    _addDisplay(){} _replaceDisplay(){} _removeDisplay(){} _updateZOrder(){}
    _updateVisible(){} _updateBlendMode(){} _updateColor(){}
    _updateTransform(){this.updateGlobalTransform();}
    _identityTransform(){}
    _updateFrame(){
      this.mesh=null;
      const g=this._geometryData,t=this._textureData;
      if(!g||!t)return;
      const ints=g.data.intArray,floats=g.data.floatArray,off=g.offset,n=ints[off];
      let vo=ints[off+2];if(vo<0)vo+=65536;
      const vertices=new Float32Array(n*2),uv=new Float32Array(n*2);
      const indices=new Uint16Array(ints[off+1]*3),r=t.region,scale=this._armature.armatureData.scale;
      for(let i=0;i<n*2;i+=2){
        vertices[i]=floats[vo+i]*scale;vertices[i+1]=floats[vo+i+1]*scale;
        const u=floats[vo+n*2+i],v=floats[vo+n*2+i+1];
        uv[i]=r.x+(t.rotated?1-v:u)*r.width;uv[i+1]=r.y+(t.rotated?u:v)*r.height;
      }
      for(let i=0;i<indices.length;i++)indices[i]=ints[off+4+i];
      this.mesh={vertices,uv,indices};
    }
    _updateMesh(){
      const g=this._geometryData,mesh=this.mesh;if(!mesh||!g)return;
      const ints=g.data.intArray,floats=g.data.floatArray,scale=this._armature.armatureData.scale;
      const deform=this._displayFrame.deformVertices,hasDeform=deform.length>0&&g.inheritDeform;
      if(g.weight){
        const bones=this._geometryBones,w=g.weight,n=ints[g.offset];
        let fo=ints[w.offset+1];if(fo<0)fo+=65536;
        let bi=w.offset+2+bones.length,di=0;
        for(let i=0;i<n;i++){
          let x=0,y=0;const count=ints[bi++];
          for(let j=0;j<count;j++){
            const bone=bones[ints[bi++]],weight=floats[fo++];
            let px=floats[fo++]*scale,py=floats[fo++]*scale;
            if(hasDeform){px+=deform[di++];py+=deform[di++];}
            if(bone){const m=bone.globalTransformMatrix;x+=(m.a*px+m.c*py+m.tx)*weight;y+=(m.b*px+m.d*py+m.ty)*weight;}
          }
          mesh.vertices[i*2]=x;mesh.vertices[i*2+1]=y;
        }
      }else{
        let vo=ints[g.offset+2];if(vo<0)vo+=65536;
        for(let i=0;i<mesh.vertices.length;i++)mesh.vertices[i]=floats[vo+i]*scale+(hasDeform?deform[i]:0);
      }
    }
  }
  class Proxy {
    dbInit(){} dbClear(){} dbUpdate(){}
    hasDBEventListener(){return false;} dispatchDBEvent(){}
    addDBEventListener(){} removeDBEventListener(){}
  }
  class Factory extends db.BaseFactory {
    constructor(){super();this._dragonBones=new db.DragonBones(new Proxy());}
    _buildTextureAtlasData(atlas,image){if(atlas)atlas.image=image;else atlas=db.BaseObject.borrowObject(CanvasAtlas);return atlas;}
    _buildArmature(pack){const a=db.BaseObject.borrowObject(db.Armature),proxy=new Proxy();a.init(pack.armature,proxy,proxy,this._dragonBones);return a;}
    _buildSlot(pack,data,armature){const slot=db.BaseObject.borrowObject(CanvasSlot);slot.init(data,armature,{},{});return slot;}
  }
  function triangle(ctx,img,vertices,uv,i,j,k){
    const x0=vertices[i*2],y0=vertices[i*2+1],x1=vertices[j*2],y1=vertices[j*2+1],x2=vertices[k*2],y2=vertices[k*2+1];
    const u0=uv[i*2],v0=uv[i*2+1],u1=uv[j*2],v1=uv[j*2+1],u2=uv[k*2],v2=uv[k*2+1];
    const det=(u1-u0)*(v2-v0)-(u2-u0)*(v1-v0);if(Math.abs(det)<.00001)return;
    const a=((x1-x0)*(v2-v0)-(x2-x0)*(v1-v0))/det,c=((u1-u0)*(x2-x0)-(u2-u0)*(x1-x0))/det;
    const b=((y1-y0)*(v2-v0)-(y2-y0)*(v1-v0))/det,d=((u1-u0)*(y2-y0)-(u2-u0)*(y1-y0))/det;
    ctx.save();ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.closePath();ctx.clip();
    ctx.transform(a,b,c,d,x0-a*u0-c*v0,y0-b*u0-d*v0);ctx.drawImage(img,0,0);ctx.restore();
  }
  function drawArmature(ctx,armature){
    for(const slot of armature.getSlots()){
      if(slot.displayIndex<0||!slot.visible||!slot.parent.visible)continue;
      ctx.save();const color=slot._colorTransform;ctx.globalAlpha*=color.alphaMultiplier*slot._globalAlpha;
      if(slot._blendMode===1)ctx.globalCompositeOperation='lighter';
      const m=slot.globalTransformMatrix,child=slot.childArmature;
      if(child){ctx.transform(m.a,m.b,m.c,m.d,m.tx,m.ty);drawArmature(ctx,child);ctx.restore();continue;}
      const t=slot._textureData,img=t?.parent.image;
      if(img){
        if(slot.mesh){
          if(!slot._geometryData.weight)ctx.transform(m.a,m.b,m.c,m.d,m.tx,m.ty);
          const mesh=slot.mesh;for(let i=0;i<mesh.indices.length;i+=3)triangle(ctx,img,mesh.vertices,mesh.uv,...mesh.indices.slice(i,i+3));
        }else{
          const r=t.region,scale=t.parent.scale*armature.armatureData.scale;
          ctx.transform(m.a,m.b,m.c,m.d,m.tx,m.ty);ctx.translate(-slot._pivotX,-slot._pivotY);ctx.scale(scale,scale);
          if(t.rotated){ctx.translate(0,r.width);ctx.rotate(-Math.PI/2);}
          ctx.drawImage(img,r.x,r.y,r.width,r.height,0,0,r.width,r.height);
        }
      }
      ctx.restore();
    }
  }
  function visibleBounds(armature){
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    const identity={a:1,b:0,c:0,d:1,tx:0,ty:0};
    function visit(a,parent){for(const slot of a.getSlots()){
      if(slot.displayIndex<0||!slot.visible||!slot.parent.visible||slot._colorTransform.alphaMultiplier*slot._globalAlpha<.01)continue;
      const t=slot.globalTransformMatrix,m={a:parent.a*t.a+parent.c*t.b,b:parent.b*t.a+parent.d*t.b,c:parent.a*t.c+parent.c*t.d,d:parent.b*t.c+parent.d*t.d,tx:parent.a*t.tx+parent.c*t.ty+parent.tx,ty:parent.b*t.tx+parent.d*t.ty+parent.ty};
      if(slot.childArmature){visit(slot.childArmature,m);continue;}
      const texture=slot._textureData;if(!texture)continue;
      let points;
      if(slot.mesh){points=slot.mesh.vertices;if(slot._geometryData.weight)Object.assign(m,parent);}
      else{const r=texture.region,s=texture.parent.scale*a.armatureData.scale,w=(texture.rotated?r.height:r.width)*s,h=(texture.rotated?r.width:r.height)*s,x=-slot._pivotX,y=-slot._pivotY;points=[x,y,x+w,y,x+w,y+h,x,y+h];}
      for(let i=0;i<points.length;i+=2){const x=m.a*points[i]+m.c*points[i+1]+m.tx,y=m.b*points[i]+m.d*points[i+1]+m.ty;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
    }}
    visit(armature,identity);
    return Number.isFinite(minX)?{x:minX,y:minY,width:maxX-minX,height:maxY-minY}:armature.armatureData.aabb;
  }
  class Library {
    constructor(data){this.data=data;this.factory=new Factory();this.ready=new Set();this.failed=new Set();}
    add(id,image){const entry=this.data[id];this.factory.parseDragonBonesData(entry.skeleton,id);this.factory.parseTextureAtlasData(entry.atlas,image,id);this.ready.add(id);}
    load(){return Promise.all(Object.entries(this.data).map(([id,entry])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{try{this.add(id,img);}catch(e){this.failed.add(id);console.error('Animation',id,e);}resolve();};img.onerror=()=>{this.failed.add(id);resolve();};img.src=entry.texture;})));}
    create(id){return this.createPart(id,this.data[id]?.armature);}
    createPart(id,name){if(!this.ready.has(id)||!name)return null;const e=this.data[id],a=this.factory.buildArmature(name,id);return a?new Actor(a,{...e,part:name!==e.armature}):null;}
    flush(){this.factory._dragonBones.advanceTime(0);}
  }
  class Actor {
    constructor(armature,entry){
      this.armature=armature;this.entry=entry;this.names=[...armature.animation.animationNames];
      this.idle=this.find(entry.plant==='Tallnut'?['Idle0','Idle1']:['Idle','Idle1','Idle0']);this.mode='idle';this.hold=0;
      this.armature.animation.play(this.idle,0);this.armature.advanceTime(.01);
      const box=visibleBounds(armature);this.box={x:box.x,y:box.y,width:box.width,height:box.height};
    }
    find(choices){return choices.find(n=>this.names.includes(n))||this.names[0];}
    act(mode,clip){
      if(this.mode==='death'||(this.mode==='skill'&&mode!=='death'))return;
      const choices=mode==='death'?['Death','Death1','Death0','Death_Baby']:mode==='skill'?['Food','FoodStart','FoodPullStart','FoodLoop','Attack','Water']:mode==='heal'?['Produce','HealStart','Food','Water']:['Shoot','Lob','Attack','Shoot111','FoodShoot','AbsorbStart','Produce'];
      const name=clip&&this.names.includes(clip)?clip:choices.find(n=>this.names.includes(n));if(!name)return;
      this.mode=mode;this.hold=mode==='skill'?1.1:0;
      this.armature.animation.fadeIn(name,.06,mode==='skill'&&name==='Food'?Math.max(1,Math.ceil(.85/this.armature.animation.animations[name].duration)):1);
    }
    update(dt){
      this.hold=Math.max(0,this.hold-dt);this.armature.advanceTime(dt);
      if(this.mode!=='idle'&&this.mode!=='death'&&this.hold===0&&this.armature.animation.lastAnimationState?.isCompleted){this.mode='idle';this.armature.animation.fadeIn(this.idle,.1,0);}
    }
    draw(ctx,x,y,width=100,height=110){
      const b=this.box,scale=Math.min(width/Math.max(1,b.width),height/Math.max(1,b.height));
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.translate(-b.x-b.width/2,-b.y-b.height);drawArmature(ctx,this.armature);ctx.restore();
    }
    point(name,x,y,width=105,height=110){
      const b=this.box,scale=Math.min(width/Math.max(1,b.width),height/Math.max(1,b.height));
      const slot=this.armature.getSlot(name),bone=this.armature.getBone(name),m=slot?.globalTransformMatrix||bone?.globalTransformMatrix;
      return m?{x:x+(m.tx-b.x-b.width/2)*scale+9,y:y+(m.ty-b.y-b.height)*scale}:null;
    }
    drawCentered(ctx,x,y,size=28,angle=0){const b=this.box,scale=size/Math.max(1,b.width,b.height);ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.translate(-b.x-b.width/2,-b.y-b.height/2);drawArmature(ctx,this.armature);ctx.restore();}
    dispose(){this.armature.dispose();}
  }
  const exports={Library,Actor,drawArmature};
  if(typeof module!=='undefined'&&module.exports)module.exports=exports;else root.PlantAnimation=exports;
})(typeof window!=='undefined'?window:this);
