(function(root){
  'use strict';
  class View{
    constructor(library){this.library=library;this.actors=new Map();this.state=null;}
    sync(state,dt){
      if(this.state!==state){for(const v of this.actors.values())v.actor?.dispose();this.actors.clear();this.state=state;}
      const live=new Set();
      for(const s of [...state.shots,...state.fx.filter(f=>f.plant&&f.kind==='beam')]){
        if(s.delay>0)continue;const id=s.id;live.add(id);let part=s.flaming?['projectile-fire','YellowPeaPrj',38]:CombatData[s.kind||s.plant]?.part;
        if(s.butter)part=['kernel','ProjectileButter0',31];if(!part)continue;
        const key=part[0]+':'+part[1],old=this.actors.get(id);
        if(old?.key!==key){old?.actor?.dispose();this.actors.delete(id);}
        let v=this.actors.get(id);if(!v){const actor=this.library.createPart(part[0],part[1]);if(actor){v={key,actor,size:part[2]};this.actors.set(id,v);}}
        v?.actor.update(dt);
      }
      for(const [id,v] of this.actors)if(!live.has(id)){v.actor.dispose();this.actors.delete(id);}
    }
    drawShot(c,s){if(s.delay>0)return;const v=this.actors.get(s.id);if(!v)return;c.save();if(s.kind==='fume')c.globalAlpha=.75;v.actor.drawCentered(c,s.x,s.y,v.size,s.lob?((s.flight||0)/(s.duration||1))*Math.PI*.8:0);c.restore();}
    drawEffect(c,f){const v=this.actors.get(f.id);if(!v)return false;const b=v.actor.box,length=Math.min(f.length||900,1080-f.x),height=f.plant==='dragon'?75:28;c.save();c.globalAlpha=Math.min(1,f.ttl*4);c.translate(f.x,f.y-height/2);c.scale(length/Math.max(1,b.width),height/Math.max(1,b.height));c.translate(-b.x,-b.y);PlantAnimation.drawArmature(c,v.actor.armature);c.restore();return true;}
  }
  root.WeaponView=View;
})(window);
