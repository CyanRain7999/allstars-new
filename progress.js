(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.GameData,C=D.Campaign;
  const BANNERS={normal:{name:'友情召唤',rates:{R:.8,SR:.19,SSR:.01},currency:'tickets',cost:1},premium:{name:'钻石召唤',rates:{R:.6,SR:.32,SSR:.08},currency:'gems',cost:280}};
  const QUESTS=[{id:'clear',name:'主线通关 3 次',target:3,key:'clears',reward:{gems:40,tickets:1}},{id:'kill',name:'击败 50 只僵尸',target:50,key:'kills',reward:{coins:500,essence:2}},{id:'draw',name:'完成 1 次召唤',target:1,key:'draws',reward:{gems:30}}];
  const LOGIN=[{coins:350,tickets:1},{gems:80},{coins:600,essence:3},{tickets:2},{gems:120},{coins:1000,essence:5},{gems:280,tickets:3}];
  const day=now=>new Date((now??Date.now())+8*3600000).toISOString().slice(0,10);
  function daily(save,now){const today=day(now);if(save.daily.day!==today){save.daily.day=today;save.daily.kills=0;save.daily.clears=0;save.daily.draws=0;save.daily.claimed=[];}if(save.draws.normalDay!==today){save.draws.normalDay=today;save.draws.normalFree=0;}return today;}
  function grant(save,reward){for(const [key,value] of Object.entries(reward))if(['coins','gems','tickets','shards','essence'].includes(key))save[key]=Math.min(999999999,save[key]+value);}
  function rewardText(r){return Object.entries(r).filter(([,v])=>v>0).map(([key,v])=>({coins:'金币',gems:'钻石',tickets:'召唤券',shards:'万能碎片',essence:'精华'}[key]||key)+' +'+v).join(' · ');}
  function owned(save,id){return save.owned.includes(id);}
  function addPlant(save,id,place=true){if(owned(save,id))return false;save.owned.push(id);if(place){const p=D.byId[id],slots=p.role==='defend'?[1,3,5,6,0,2,4]:p.role==='heal'?[6,2,4,0,3,5,1]:[0,2,4,6,3,5,1];const slot=slots.find(i=>!save.team[i]);if(slot!==undefined)save.team[slot]=id;}return true;}
  function availability(save,banner,now=Date.now()){daily(save,now);const free=banner==='normal'?save.draws.normalFree<3&&now>=save.draws.normalNext:now>=save.draws.premiumNext;return {free,next:banner==='normal'?save.draws.normalNext:save.draws.premiumNext,remaining:3-save.draws.normalFree};}
  function draw(save,banner,count=1,{free=false,now=Date.now(),random=Math.random}={}){
    const config=BANNERS[banner];if(!config||![1,10].includes(count))throw new Error('召唤方式无效');
    const offer=availability(save,banner,now),cost=count===10&&banner==='premium'?2520:config.cost*count;
    if(free){if(count!==1||!offer.free)throw new Error('免费召唤还未恢复');}else if(save[config.currency]<cost)throw new Error(config.currency==='gems'?'钻石不足，去主线和每日任务获取。':'召唤券不足，去每日签到和主线首领关获取。');
    if(free){if(banner==='normal'){save.draws.normalFree++;save.draws.normalNext=now+10*60000;}else save.draws.premiumNext=now+48*3600000;}else save[config.currency]-=cost;
    const results=[];let high=false;
    for(let i=0;i<count;i++){
      const r=Math.max(0,Math.min(.999999,random()));let grade=r<config.rates.SSR?'SSR':r<config.rates.SSR+config.rates.SR?'SR':'R';
      const pity=banner==='premium'&&save.draws.pity>=29;
      if(pity)grade='SSR';else if(count===10&&i===9&&!high&&grade==='R')grade='SR';
      const pool=D.plants.filter(p=>D.grade(p)===grade),pick=pool[Math.floor(Math.max(0,Math.min(.999999,random()))*pool.length)];
      const fresh=addPlant(save,pick.id,false),fragments=fresh?0:({R:8,SR:16,SSR:32}[grade]);
      if(!fresh)save.fragments[pick.id]+=fragments;
      if(banner==='premium'){save.draws.premium++;save.draws.pity=grade==='SSR'?0:save.draws.pity+1;}
      if(grade!=='R')high=true;
      const result={id:pick.id,grade,fresh,fragments,pity,time:now,banner};results.push(result);save.draws.history.unshift(result);
    }
    save.draws.history=save.draws.history.slice(0,30);save.daily.draws+=count;return results;
  }
  function exchange(save,id){if(!owned(save,id)||save.fragments[id]<8)throw new Error('需要 8 枚该植物碎片');save.fragments[id]-=8;save.shards+=4;return 4;}
  function craft(save,id){const p=D.byId[id];if(!p||owned(save,id))throw new Error('已经拥有这位伙伴');const cost=D.fragmentCost(p);if(save.shards<cost)throw new Error('万能碎片不足');save.shards-=cost;addPlant(save,id,false);return p;}
  function evolveCost(save,id){const p=D.byId[id],rank=save.stars[id]-p.rarity;return {essence:5+rank*5,fragments:8+rank*4};}
  function evolve(save,id){const cost=evolveCost(save,id);if(!owned(save,id)||save.stars[id]>=6)throw new Error('这位伙伴无法继续进化');if(save.essence<cost.essence||save.fragments[id]<cost.fragments)throw new Error('精华或该植物碎片不足');save.essence-=cost.essence;save.fragments[id]-=cost.fragments;save.stars[id]++;}
  function claimLogin(save,now=Date.now()){const today=daily(save,now);if(save.daily.claimDay===today)throw new Error('今天已经签到了');const yesterday=day(now-86400000);save.daily.streak=save.daily.claimDay===yesterday?save.daily.streak%7+1:1;save.daily.claimDay=today;const reward=LOGIN[save.daily.streak-1];grant(save,reward);return reward;}
  function claimQuest(save,id,now=Date.now()){daily(save,now);const q=QUESTS.find(q=>q.id===id);if(!q||save.daily[q.key]<q.target||save.daily.claimed.includes(id))throw new Error('任务尚未完成或已领取');save.daily.claimed.push(id);grant(save,q.reward);return q.reward;}
  function worldStars(save,wi){const w=C.worlds[wi];return w.levels.reduce((n,_,i)=>n+(save.cleared[w.start+i]||0),0);}
  function starRewards(wi){const w=C.worlds[wi];return [Math.min(10,w.count),Math.floor(w.count*1.5),w.count*3].map((target,i)=>({target,key:wi+'-'+target,reward:{coins:500*(i+1)*(1+wi),gems:80*(i+1),tickets:i+1}}));}
  function claimStars(save,wi,target){const item=starRewards(wi).find(r=>r.target===target);if(!item||worldStars(save,wi)<target||save.starClaims.includes(item.key))throw new Error('星星不足或已经领取');save.starClaims.push(item.key);grant(save,item.reward);return item.reward;}
  function stageReward(save,index){const s=C.get(index),first=!save.cleared[index];return {coins:first?220+s.world*110+s.local*24:65+s.world*25+s.local*5,gems:first?30+(s.boss?50:0):0,tickets:first&&s.boss?1:0,essence:first?2+(s.boss?2:0):1};}
  function finish(save,index,result,endless=false,now=Date.now()){
    daily(save,now);save.daily.kills+=result.kills;const first=!save.cleared[index],newPlants=[];let reward={};
    if(endless){reward={coins:result.kills*16,essence:Math.floor(result.kills/12)};save.bestEndless=Math.max(save.bestEndless,Math.max(0,result.wave-1));}
    else if(result.win){reward=stageReward(save,index);save.cleared[index]=Math.max(save.cleared[index]||0,result.stars);save.daily.clears++;const gift={0:'cabbage',2:'snow',4:'bonk'}[index];if(first&&gift&&addPlant(save,gift))newPlants.push(gift);if(first&&index<5){save.fragments.pea+=4;save.fragments.wallnut+=4;save.fragments.sunflower+=4;}}
    grant(save,reward);return {reward,newPlants,first};
  }
  function recommend(save){
    const ids=save.owned.filter(id=>D.byId[id]),att=ids.filter(id=>D.byId[id].role==='attack').sort((a,b)=>D.stats(b,save).atk/D.byId[b].interval-D.stats(a,save).atk/D.byId[a].interval),def=ids.filter(id=>D.byId[id].role==='defend').sort((a,b)=>D.stats(b,save).hp-D.stats(a,save).hp),heal=ids.filter(id=>D.byId[id].role==='heal').sort((a,b)=>D.stats(b,save).atk-D.stats(a,save).atk);
    const team=Array(7).fill(null);for(let l=0;l<3;l++){team[l*2]=att.shift()||null;team[l*2+1]=def.shift()||null;}team[6]=heal.shift()||att.shift()||def.shift()||null;const rest=[...heal,...att,...def];for(let i=0;i<6;i++)if(!team[i])team[i]=rest.shift()||null;return team;
  }
  const exports={BANNERS,QUESTS,LOGIN,day,daily,grant,rewardText,owned,addPlant,availability,draw,exchange,craft,evolveCost,evolve,claimLogin,claimQuest,worldStars,starRewards,claimStars,stageReward,finish,recommend};
  if(typeof module!=='undefined'&&module.exports)module.exports=exports;else root.Progress=exports;
})(typeof window!=='undefined'?window:this);
