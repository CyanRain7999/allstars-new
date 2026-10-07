(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.GameData;
  const M=typeof module!=='undefined'&&module.exports?require('./combat-data.js'):root.CombatData;
  class Battle {
    constructor(save,stage,endless=false) {
      this.stage=stage;this.config=D.Campaign.get(stage);this.world=this.config.world;this.endless=endless;this.lanes=endless?[0,1,2]:this.config.lanes;this.maxWaves=this.config.waves;this.time=0;this.wave=0;this.waveWait=1;this.units=[];this.enemies=[];this.shots=[];this.pending=[];this.fx=[];this.events=[];this.beans={attack:2,heal:1,defend:1};this.kills=0;this.spawned=0;this.lives=3;this.finished=false;this.result=null;this.nextId=1;this.beanTimer=0;this.auto=save.auto;this.seed=12345+stage*79;this.cartLane=save.cartLane;
      save.team.forEach((id,i)=>{if(!id||!D.byId[id]||!save.owned.includes(id))return;const p=D.byId[id],s=D.stats(id,save);this.units.push({id:this.nextId++,plant:id,slot:i,lane:i===6?this.cartLane:Math.floor(i/2),x:i===6?D.FIELD.cartX:i%2===0?D.FIELD.rearX:D.FIELD.frontX,hp:s.hp,maxHp:s.hp,atk:s.atk,cooldown:.2+i*.11,healTimer:2,skillCooldown:0,shield:0,flash:0,acted:0,regen:0});});
      this.bond=this.units.some(u=>u.plant==='pea')&&this.units.some(u=>u.plant==='sunflower');
      if(this.bond)for(const u of this.units)if(u.plant==='pea'||u.plant==='sunflower')u.atk=Math.round(u.atk*1.15);
    }
    random(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}
    emit(type,data={}){this.events.push({type,...data});}
    addBean(role) {if(Object.values(this.beans).reduce((a,b)=>a+b,0)<8){this.beans[role]++;this.emit('bean',{role});}}
    startWave() {
      this.wave++;this.emit('wave',{wave:this.wave});this.schedule=[];this.waveTime=0;
      const count=this.endless?6+Math.min(12,this.wave-1):3+this.lanes.length+Math.min(4,Math.floor(this.config.local/6))+(this.wave-1);
      for(let i=0;i<count;i++){let type='basic',r=this.random();if(this.stage>=2&&r>.64)type='cone';if(this.stage>=5&&r>.87)type='bucket';if(this.stage>=3&&r<.12)type='runner';if(this.world>=1&&r<.1)type='thrower';this.schedule.push({at:i*1.9,lane:this.lanes[i%this.lanes.length],type});}
      if((!this.endless&&this.config.boss&&this.wave===this.maxWaves)||(this.endless&&this.wave%5===0))this.schedule.push({at:5,lane:this.lanes[Math.floor(this.lanes.length/2)],type:'boss'});
      this.schedule.sort((a,b)=>a.at-b.at);
    }
    spawn(e) {
      const base={basic:[340,24,45],cone:[540,21,57],bucket:[870,18,70],runner:[300,43,48],thrower:[600,20,60],boss:[3200,15,165]}[e.type];
      const scale=this.endless?.65+(this.wave-1)*.16:this.config.scale;
      this.enemies.push({id:this.nextId++,type:e.type,lane:e.lane,x:1010+this.random()*40,hp:Math.round(base[0]*scale),maxHp:Math.round(base[0]*scale),speed:base[1],atk:Math.round(base[2]*scale),cooldown:.5,slow:0,freeze:0,flash:0,armor:e.type==='bucket'? .25:e.type==='cone'?.12:0,acted:0});this.spawned++;
    }
    damage(e,amount,pierce=false){if(e.hp<=0)return;e.hp-=amount*(pierce?1:1-e.armor);e.flash=.12;this.fx.push({kind:'number',x:e.x,y:this.y(e.lane)-65,text:Math.round(amount*(pierce?1:1-e.armor)),color:'#fff6c0',ttl:.8});if(e.hp<=0){this.kills++;this.emit('kill',{type:e.type});this.fx.push({kind:'burst',x:e.x,y:this.y(e.lane)-20,color:'#ced779',ttl:.5});if(this.kills%2===0)this.addBean(['attack','heal','defend'][(this.kills/2-1)%3]);}}
    damagePlant(u,amount){const absorbed=Math.min(u.shield,amount);u.shield-=absorbed;u.hp-=amount-absorbed;u.flash=.15;if(u.plant==='primalnut'&&u.hp>0)u.shield=Math.min(u.maxHp*.15,u.shield+amount*.2);if(u.hp<=0){u.hp=0;this.emit('plantDown',{plant:u.plant,unitId:u.id});}}
    heal(u,amount){if(u.hp<=0)return;const real=Math.min(u.maxHp-u.hp,amount);u.hp+=real;if(real>5)this.fx.push({kind:'number',x:u.x,y:this.y(u.lane)-65,text:'+'+Math.round(real),color:'#daffa8',ttl:1});}
    y(lane){return D.FIELD.baseline+lane*D.FIELD.rowHeight;}
    moveCart(lane){const u=this.units.find(u=>u.slot===6&&u.hp>0);if(!u||lane<0||lane>2||this.finished)return false;u.lane=lane;this.cartLane=lane;this.fx.push({kind:'ring',x:u.x,y:this.y(lane)-20,color:'#ffde77',ttl:.5});return true;}
    skill(slot) {
      const u=this.units.find(u=>u.slot===slot&&u.hp>0);if(!u||this.finished||u.skillCooldown>0)return false;
      const p=D.byId[u.plant],cost=p.role==='heal'?1:2;if(this.beans[p.role]<cost)return false;
      this.beans[p.role]-=cost;u.skillCooldown=6;u.skillLock=1.1;u.acted=.6;this.pending=this.pending.filter(a=>a.unit!==u.id);this.emit('skill',{plant:u.plant,skill:p.skill,unitId:u.id});this.fx.push({kind:'ring',x:u.x,y:this.y(u.lane)-25,color:p.color,ttl:.8});
      const row=this.enemies.filter(e=>e.hp>0&&e.lane===u.lane);
      if(p.role==='heal') {for(const other of this.units)this.heal(other,other.maxHp*(u.plant==='hypno'?.28:.42));if(u.plant==='hypno')for(const e of this.enemies)e.freeze=3;if(u.plant==='moon')for(const other of this.units)if(other.hp>0)other.shield+=other.maxHp*.15;if(u.plant==='twin')this.addBean('attack');if(u.plant==='aloe')for(const other of this.units)if(other.hp>0)other.regen=6;}
      else if(u.plant==='cherry'){for(const e of this.enemies)this.damage(e,u.atk*8,true);this.fx.push({kind:'explosion',x:570,y:285,color:'#ffc75c',ttl:.9});}
      else if(u.plant==='chomper'){const e=row.sort((a,b)=>a.x-b.x)[0];if(e)this.damage(e,e.type==='boss'?u.atk*8:e.hp+1,true);this.heal(u,u.maxHp*.3);}
      else if(u.plant==='magnet'){for(const e of this.enemies){e.armor=0;this.damage(e,u.atk*5,true);e.slow=4;}}
      else if(['cabbage','kernel','melon','wintermelon','coconut','threepeater','lightning','starfruit','electricpea','potato','dragon'].includes(u.plant)){
        for(const e of this.enemies){this.damage(e,u.atk*(u.plant==='coconut'?5:6),true);if(u.plant==='wintermelon')e.freeze=3;if(u.plant==='kernel')e.freeze=4;if(['lightning','electricpea'].includes(u.plant))e.freeze=1.8;if(u.plant==='coconut')e.x=Math.min(1020,e.x+120);if(u.plant==='dragon')this.burn(e,u.atk*.4,4);}
        this.fx.push({kind:'explosion',x:680,y:this.y(1)-40,color:p.color,ttl:.8});
      }
      else if(p.role==='attack'||u.plant==='pepper'||u.plant==='spike'){for(const e of row){this.damage(e,u.atk*(u.plant==='repeater'?10:8),true);if(u.plant==='snow'||u.plant==='kernel')e.freeze=4;if(u.plant==='spike')e.slow=5;if(['firepea','pepper'].includes(u.plant))this.burn(e,u.atk*.45,4);if(['citron','primalpea'].includes(u.plant))e.x=Math.min(1020,e.x+150);}this.fx.push({kind:'beam',x:u.x,y:this.y(u.lane)-30,color:p.color,ttl:.5});}
      else{u.shield+=u.maxHp*(u.plant==='bonk'?.25:.45);for(const e of row){e.x=Math.min(1020,e.x+(u.plant==='primalnut'?160:85));this.damage(e,u.atk*(u.plant==='torch'?7:u.plant==='bonk'?12:3),true);}if(u.plant==='tallnut'||u.plant==='infinut')for(const other of this.units)if(other.hp>0)other.shield+=other.maxHp*.18;}
      return true;
    }
    burn(e,power,duration){e.burn=Math.max(e.burn||0,duration);e.burnPower=Math.max(e.burnPower||0,power);e.burnTick=.7;}
    attack(u,p,e){
      const butter=p.behavior==='butter'&&this.random()<.25;
      this.emit('action',{unitId:u.id,mode:'attack',clip:butter?'Lob_Butter':M[u.plant]?.clip});
      this.pending.push({unit:u.id,target:e.id,at:this.time+(M[u.plant]?.release??.18),butter});
    }
    launch(u,p,e,butter=false){
      const row=this.enemies.filter(v=>v.hp>0&&v.lane===u.lane&&v.x>=u.x-20&&v.x-u.x<p.range);
      if(u.plant==='magnet'){this.damage(e,u.atk*(e.armor>0?1.5:1),true);e.armor=0;this.fx.push({kind:'lightning',x:u.x,y:this.y(u.lane)-55,x2:e.x,y2:this.y(e.lane)-70,color:'#d7a8eb',ttl:.28});return;}
      if(['beam','firecone','mine'].includes(p.behavior)){
        const targets=p.behavior==='firecone'?this.enemies.filter(v=>v.hp>0&&Math.abs(v.lane-u.lane)<=1&&v.x>=u.x-20&&v.x-u.x<p.range):row;
        for(const v of targets){this.damage(v,u.atk,['beam','pierce'].includes(p.behavior));if(p.behavior==='firecone')this.burn(v,u.atk*.17,2);}
        const origin=u.muzzle||{x:u.x+20,y:this.y(u.lane)-65};this.fx.push({id:this.nextId++,plant:u.plant,kind:p.behavior==='mine'?'explosion':'beam',x:origin.x,y:origin.y,color:p.color,ttl:.35,length:p.range});return;
      }
      if(p.behavior==='chain'){
        const hits=[e],near=this.enemies.filter(v=>v.hp>0&&v!==e&&Math.abs(v.x-e.x)<240&&Math.abs(v.lane-e.lane)<=1).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x));
        hits.push(...near.slice(0,2));for(const [i,v] of hits.entries()){this.damage(v,u.atk*(1-i*.15));this.fx.push({kind:'lightning',x:i?hits[i-1].x:u.x,y:this.y(i?hits[i-1].lane:u.lane)-55,x2:v.x,y2:this.y(v.lane)-55,color:'#e9f59a',ttl:.28});}return;
      }
      if(p.range<200){this.damage(e,u.atk,p.behavior==='spike');this.fx.push({kind:'hit',x:e.x-15,y:this.y(e.lane)-30,color:p.color,ttl:.2});return;}
      let power=u.atk;if(u.plant==='magnet'&&e.armor>0)power*=1.5;
      const lanes=p.behavior==='threelane'?[0,1,2]:p.behavior==='star'?[u.lane-1,u.lane,u.lane+1].filter(l=>l>=0&&l<3):[u.lane];
      for(const lane of lanes)for(let i=0;i<(u.plant==='repeater'?2:1);i++){
        const target=lane===e.lane?e:this.enemies.find(v=>v.hp>0&&v.lane===lane&&v.x>u.x);
        const lob=['lob','butter','splash','icesplash'].includes(p.behavior),origin=u.muzzles?.[lane]||u.muzzle||{x:u.x+25,y:this.y(u.lane)-70};
        const s={id:this.nextId++,x:origin.x,y:origin.y,startX:origin.x,startY:origin.y,endY:this.y(lane)-70,lane,target:target?.id,power,speed:p.behavior==='pierce'?290:530,kind:u.plant,color:p.color,behavior:p.behavior,butter,hits:[],returning:false,delay:i*.1,range:p.range,origin:origin.x};
        if(lob){s.endX=target?.x||1000;s.flight=0;s.duration=Math.max(.45,(s.endX-s.x)/650);s.lob=true;}
        this.shots.push(s);
      }
    }
    impact(s,e){
      const b=s.behavior;
      this.damage(e,s.power*(b==='lob'?1-e.armor*.5:1),['lob','pierce'].includes(b));
      if(s.kind==='snow'||b==='icesplash')e.slow=3;
      if(s.butter)e.freeze=2;
      if(b==='burn')this.burn(e,s.power*.2,3);
      if(b==='charged'||b==='knockback'){e.x=Math.min(1040,e.x+(b==='charged'?50:25));if(b==='knockback'&&this.random()<.2)e.freeze=.8;}
      if(['splash','icesplash','cannon','electric'].includes(b))for(const v of this.enemies){if(v===e||v.hp<=0||Math.abs(v.lane-e.lane)>1||Math.abs(v.x-e.x)>(b==='cannon'?170:115))continue;this.damage(v,s.power*.5);if(b==='icesplash')v.slow=3;}
      if(s.lob)this.fx.push({kind:'burst',x:e.x,y:this.y(e.lane)-20,color:s.color,ttl:.4});
    }
    update(dt) {
      if(this.finished)return;dt=Math.min(.1,dt);this.time+=dt;this.beanTimer+=dt;if(this.beanTimer>=9){this.beanTimer-=9;this.addBean(['attack','heal','defend'][Math.floor(this.time/9)%3]);}
      if(this.waveWait>=0){this.waveWait-=dt;if(this.waveWait<0)this.startWave();}
      if(this.schedule){this.waveTime+=dt;while(this.schedule.length&&this.schedule[0].at<=this.waveTime)this.spawn(this.schedule.shift());}
      for(const u of this.units){u.flash=Math.max(0,u.flash-dt);u.acted=Math.max(0,u.acted-dt);u.skillCooldown=Math.max(0,u.skillCooldown-dt);u.skillLock=Math.max(0,(u.skillLock||0)-dt);if(u.hp<=0)continue;const p=D.byId[u.plant];
        if(this.auto&&u.skillCooldown===0){const row=this.enemies.filter(e=>e.hp>0&&e.lane===u.lane);if((p.role==='heal'&&this.units.some(v=>v.hp>0&&v.hp<v.maxHp*.68))||(p.role==='attack'&&row.length>=2)||(p.role==='defend'&&row.some(e=>e.x<u.x+160)))this.skill(u.slot);}
        if(u.regen>0){u.regen-=dt;u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.025*dt);}
        if(p.role==='heal'||p.behavior==='regenshield'){u.healTimer-=dt;if(u.healTimer<=0){u.healTimer=3.6;
          if(p.behavior==='regenshield'){this.heal(u,u.maxHp*.055);u.shield=Math.min(u.maxHp*.25,u.shield+u.maxHp*.06);}
          else{const targets=this.units.filter(v=>v.hp>0&&v.hp<v.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp).slice(0,p.behavior==='doubleheal'?2:1);for(const target of targets){this.heal(target,u.atk*3+target.maxHp*.045);if(p.behavior==='regenheal')target.regen=4;this.fx.push({kind:'heal',x:target.x,y:this.y(target.lane)-35,color:'#c1ed7a',ttl:.8});}if(targets.length)this.emit('action',{unitId:u.id,mode:'heal'});}
        }}
        u.cooldown-=dt;const multi=['threelane','star'].includes(p.behavior);const e=this.enemies.filter(e=>e.hp>0&&(e.lane===u.lane||multi)&&e.x>=u.x-20&&e.x-u.x<p.range).sort((a,b)=>a.x-b.x)[0];if(e&&u.cooldown<=0&&u.skillLock===0&&p.role!=='heal'){u.cooldown=Math.max(p.interval,(M[u.plant]?.release||0)+.18);u.acted=.2;this.attack(u,p,e);}
      }
      const ready=this.pending.filter(a=>a.at<=this.time);this.pending=this.pending.filter(a=>a.at>this.time);for(const a of ready){const u=this.units.find(u=>u.id===a.unit&&u.hp>0);if(!u||u.skillLock>0)continue;const p=D.byId[u.plant],e=this.enemies.find(e=>e.id===a.target&&e.hp>0)||this.enemies.find(e=>e.hp>0&&e.lane===u.lane&&e.x-u.x<p.range);if(e)this.launch(u,p,e,a.butter);}
      for(const e of this.enemies){e.flash=Math.max(0,e.flash-dt);e.acted=Math.max(0,e.acted-dt);if(e.hp<=0)continue;if(e.burn>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.7;this.damage(e,e.burnPower,true);}}e.slow=Math.max(0,e.slow-dt);e.freeze=Math.max(0,e.freeze-dt);if(e.freeze>0)continue;e.cooldown-=dt;const front=this.units.filter(u=>u.hp>0&&u.lane===e.lane&&u.x<e.x+20).sort((a,b)=>b.x-a.x)[0];const dist=front?e.x-front.x:1000;
        if(front&&(dist<73||(e.type==='thrower'&&dist<420))){if(e.cooldown<=0){e.cooldown=e.type==='boss'?1.6:e.type==='thrower'?2.1:1.2;e.acted=.25;this.damagePlant(front,e.atk);if(e.type==='boss'&&this.random()<.25){this.emit('boss');for(const u of this.units)if(u.hp>0)this.damagePlant(u,e.atk*.4);this.fx.push({kind:'explosion',x:e.x-100,y:this.y(e.lane),color:'#f48754',ttl:.6});}}}else e.x-=e.speed*(e.slow>0?.48:1)*dt;
        if(e.x<45){e.hp=0;this.lives--;this.emit('breach');}
      }
      for(const s of this.shots){
        if(s.delay>0){s.delay-=dt;continue;}
        if(s.lob){s.flight+=dt;const target=this.enemies.find(v=>v.id===s.target&&v.hp>0);if(target)s.endX=target.x;const t=Math.min(1,s.flight/s.duration);s.x=s.startX+(s.endX-s.startX)*t;s.y=s.startY+(s.endY-s.startY)*t-Math.sin(t*Math.PI)*130;if(t<1)continue;const e=target||this.enemies.find(v=>v.hp>0&&v.lane===s.lane&&Math.abs(v.x-s.x)<65);if(e)this.impact(s,e);s.dead=true;continue;}
        const prev=s.x;
        s.x+=s.speed*dt;
        if(s.lane!==this.units.find(u=>Math.abs(u.x-s.origin)<90)?.lane)s.y=s.startY+(s.endY-s.startY)*Math.min(1,(s.x-s.startX)/220);
        if(!s.flaming&&['pea','repeater','threepeater','primalpea'].includes(s.kind))for(const u of this.units)if(u.plant==='torch'&&u.hp>0&&u.lane===s.lane&&prev<u.x&&s.x>=u.x){s.flaming=true;s.power*=1.3;s.behavior='burn';}
        if(s.behavior==='pierce'&&s.x-s.origin>s.range)s.dead=true;
        if(s.behavior==='return'&&s.x>1060&&!s.returning){s.returning=true;s.speed=-530;s.hits=[];}
        const hits=this.enemies.filter(e=>e.hp>0&&e.lane===s.lane&&!s.hits.includes(e.id)&&Math.abs(e.x-s.x)<30).sort((a,b)=>a.x-b.x);
        for(const e of hits){this.impact(s,e);s.hits.push(e.id);if(!['return','electric','pierce'].includes(s.behavior)){s.dead=true;break;}}
      }
      this.shots=this.shots.filter(s=>!s.dead&&s.x<1100&&s.x>80);this.enemies=this.enemies.filter(e=>e.hp>0);for(const f of this.fx)f.ttl-=dt;this.fx=this.fx.filter(f=>f.ttl>0);
      if(this.lives<=0||!this.units.some(u=>u.hp>0))this.finish(false);
      else if(this.schedule&&this.schedule.length===0&&this.enemies.length===0&&this.waveWait<0){if(!this.endless&&this.wave>=this.maxWaves)this.finish(true);else{this.schedule=null;this.waveWait=2;}}
    }
    finish(win){if(this.finished)return;this.finished=true;const alive=this.units.filter(u=>u.hp>0).length;this.result={win,stars:win?(alive===this.units.length&&this.lives===3?3:alive>=Math.ceil(this.units.length*.6)&&this.lives>=2?2:1):0,kills:this.kills,time:Math.round(this.time),wave:this.wave,alive};this.emit('finish',this.result);}
    drainEvents(){return this.events.splice(0);}
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={Battle};else root.GameCore={Battle};
})(typeof window!=='undefined'?window:this);
