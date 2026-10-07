(function (root) {
  'use strict';
  const plants = [
    { id:'pea', name:'豌豆射手', role:'attack', element:'木', hp:680, atk:88, interval:1.05, range:1000, unlock:0, skill:'豌豆风暴', desc:'稳定的远程输出。必杀向整条路倾泻豌豆，造成高额伤害。', color:'#75a948', rarity:2 },
    { id:'sunflower', name:'向日葵', role:'heal', element:'光', hp:860, atk:22, interval:1.6, range:1000, unlock:0, skill:'阳光治愈', desc:'每隔数秒治疗受伤最重的伙伴。必杀恢复全队生命。', color:'#e4ad36', rarity:2 },
    { id:'wallnut', name:'坚果', role:'defend', element:'土', hp:2400, atk:58, interval:1.3, range:100, unlock:0, skill:'坚不可摧', desc:'坚韧的前排守护者。必杀获得护盾，并击退同路僵尸。', color:'#b88957', rarity:2 },
    { id:'snow', name:'寒冰射手', role:'attack', element:'水', hp:650, atk:72, interval:1.35, range:1000, unlock:0, skill:'冰封时刻', desc:'豌豆使被命中的僵尸减速。必杀冻结整条路上的敌人。', color:'#70b8cd', rarity:3 },
    { id:'repeater', name:'双发射手', role:'attack', element:'木', hp:720, atk:68, interval:1.25, range:1000, unlock:0, skill:'双重火力', desc:'每次攻击发射两颗豌豆。必杀对同路僵尸造成猛烈打击。', color:'#598b37', rarity:3 },
    { id:'tallnut', name:'高坚果', role:'defend', element:'土', hp:3000, atk:62, interval:1.4, range:100, unlock:0, skill:'守护壁垒', desc:'拥有更强的生命与防御。必杀给全队添加护盾。', color:'#b98d56', rarity:3 },
    { id:'torch', name:'火炬树桩', role:'defend', element:'火', hp:2000, atk:85, interval:1.25, range:140, unlock:0, skill:'烈焰冲击', desc:'点燃同路伙伴的豌豆，提高伤害。必杀灼烧同路敌人。', color:'#da773f', rarity:3 },
    { id:'cherry', name:'樱桃炸弹', role:'defend', element:'火', hp:2100, atk:95, interval:1.7, range:130, unlock:1, skill:'樱桃大爆发', desc:'作为全明星前排持续作战。必杀爆炸伤害全场僵尸。', color:'#d55b57', rarity:4 },
    { id:'chomper', name:'大嘴花', role:'defend', element:'暗', hp:2100, atk:180, interval:2.2, range:145, unlock:3, skill:'一口闷', desc:'强力近战植物。必杀吞下一个普通敌人，并恢复自身生命。', color:'#9263a9', rarity:4 },
    { id:'magnet', name:'磁力菇', role:'attack', element:'暗', hp:800, atk:95, interval:1.5, range:1000, unlock:5, skill:'磁力过载', desc:'对护甲敌人造成额外伤害。必杀降低全场僵尸护甲。', color:'#a76889', rarity:4 },
    { id:'hypno', name:'魅惑菇', role:'heal', element:'暗', hp:1050, atk:34, interval:1.5, range:1000, unlock:8, skill:'迷幻梦境', desc:'持续治疗伙伴。必杀眩晕全场僵尸，并治疗全队。', color:'#b377b6', rarity:4 },
    { id:'moon', name:'月光花', role:'heal', element:'暗', hp:1100, atk:42, interval:1.5, range:1000, unlock:10, skill:'月光祝福', desc:'治疗低血量伙伴。必杀提供全队治疗与护盾。', color:'#9376ba', rarity:5 },
    { id:'cabbage', name:'卷心菜投手', role:'attack', element:'木', hp:740, atk:132, interval:1.55, range:1000, unlock:0, skill:'卷心菜雨', desc:'抛射卷心菜，无视一半护甲。必杀用卷心菜轰击全场。', color:'#7cab43', rarity:2, behavior:'lob' },
    { id:'bonk', name:'菜问', role:'defend', element:'木', hp:1850, atk:66, interval:.43, range:165, unlock:0, skill:'百裂拳', desc:'用快速拳击守住前排。必杀连续重击并击退同路敌人。', color:'#75a745', rarity:3, behavior:'punch' },
    { id:'dragon', name:'火龙草', role:'defend', element:'火', hp:1700, atk:93, interval:1.35, range:285, unlock:0, skill:'烈焰吐息', desc:'喷火灼烧前方三路的近处僵尸。必杀让三路陷入火海。', color:'#df873c', rarity:3, behavior:'firecone' },
    { id:'kernel', name:'玉米投手', role:'attack', element:'光', hp:700, atk:74, interval:1.4, range:1000, unlock:0, skill:'黄油盛宴', desc:'抛射玉米，四分之一概率投出黄油定身。必杀用黄油定住全场。', color:'#d9b84a', rarity:2, behavior:'butter' },
    { id:'bloom', name:'回旋镖射手', role:'attack', element:'木', hp:700, atk:62, interval:1.9, range:1000, unlock:0, skill:'旋风回旋镖', desc:'回旋镖穿透同路僵尸，并飞回再命中一次。必杀重创整条路。', color:'#b99548', rarity:3, behavior:'return' },
    { id:'spike', name:'地刺', role:'defend', element:'土', hp:2000, atk:80, interval:.8, range:145, unlock:0, skill:'尖刺地毯', desc:'持续刺伤近处僵尸，攻击无视护甲。必杀刺伤并减速整条路。', color:'#929d55', rarity:2, behavior:'spike' },
    { id:'twin', name:'双胞向日葵', role:'heal', element:'光', hp:920, atk:31, interval:1.8, range:1000, unlock:0, skill:'双倍阳光', desc:'每次同时治疗两位受伤伙伴。必杀治疗全队并恢复一颗攻击豆。', color:'#e1b747', rarity:3, behavior:'doubleheal' },
    { id:'melon', name:'西瓜投手', role:'attack', element:'木', hp:780, atk:155, interval:2.25, range:1000, unlock:1, skill:'西瓜轰炸', desc:'西瓜落地会溅射附近三路僵尸。必杀轰炸全场。', color:'#719b43', rarity:3, behavior:'splash' },
    { id:'firepea', name:'火焰豌豆射手', role:'attack', element:'火', hp:740, atk:105, interval:1.3, range:1000, unlock:1, skill:'炽热火力', desc:'火焰豌豆命中后持续灼烧。必杀重创并点燃整条路。', color:'#e98236', rarity:3, behavior:'burn' },
    { id:'threepeater', name:'三线射手', role:'attack', element:'木', hp:760, atk:56, interval:1.45, range:1000, unlock:2, skill:'三路齐射', desc:'一次向三条路同时发射豌豆。必杀攻击全场敌人。', color:'#629545', rarity:4, behavior:'threelane' },
    { id:'fume', name:'大喷菇', role:'attack', element:'暗', hp:1250, atk:101, interval:1.45, range:460, unlock:2, skill:'浓雾喷射', desc:'毒雾穿透前方同路僵尸并无视护甲。必杀重创整条路。', color:'#ac78b2', rarity:3, behavior:'pierce' },
    { id:'pepper', name:'火爆辣椒', role:'defend', element:'火', hp:1850, atk:100, interval:1.8, range:150, unlock:2, skill:'火爆整条路', desc:'持续守卫前排。必杀用火焰清扫整条路，并留下灼烧。', color:'#de6545', rarity:4, behavior:'pepper' },
    { id:'potato', name:'土豆地雷', role:'defend', element:'土', hp:1900, atk:210, interval:3.1, range:155, unlock:2, skill:'土豆大爆破', desc:'周期性爆炸伤害同路近处敌人。必杀在三路引爆地雷。', color:'#b89865', rarity:3, behavior:'mine' },
    { id:'lightning', name:'闪电芦苇', role:'attack', element:'雷', hp:680, atk:64, interval:1.3, range:1000, unlock:3, skill:'雷云风暴', desc:'闪电在相邻敌人间连锁，最多命中三只。必杀电击并定住全场。', color:'#c5d65f', rarity:3, behavior:'chain' },
    { id:'starfruit', name:'杨桃', role:'attack', element:'光', hp:760, atk:66, interval:1.5, range:1000, unlock:3, skill:'星光闪耀', desc:'向本路及相邻路发射星星。必杀攻击全场。', color:'#e4bf44', rarity:4, behavior:'star' },
    { id:'aloe', name:'芦荟', role:'heal', element:'水', hp:1100, atk:37, interval:1.9, range:1000, unlock:3, skill:'芦荟疗愈', desc:'重点治疗受伤伙伴，附加持续再生。必杀治疗全队并赋予再生。', color:'#85b77a', rarity:4, behavior:'regenheal' },
    { id:'primalnut', name:'原始坚果', role:'defend', element:'土', hp:2800, atk:65, interval:1.4, range:120, unlock:3, skill:'远古壁垒', desc:'更坚韧的前排，受伤时获得少量护盾。必杀护盾并强力击退。', color:'#a37c4c', rarity:4, behavior:'harden' },
    { id:'laser', name:'激光豆', role:'attack', element:'光', hp:850, atk:91, interval:1.85, range:1000, unlock:4, skill:'激光扫荡', desc:'激光穿透整条路，无视护甲。必杀用强光扫荡同路敌人。', color:'#b7d884', rarity:4, behavior:'beam' },
    { id:'citron', name:'香橼', role:'attack', element:'光', hp:860, atk:280, interval:3.5, range:1000, unlock:4, skill:'超能量球', desc:'蓄力发射大能量球，击退命中的僵尸。必杀击退并重创整条路。', color:'#dfac56', rarity:4, behavior:'charged' },
    { id:'infinut', name:'全息坚果', role:'defend', element:'水', hp:2100, atk:50, interval:1.4, range:115, unlock:4, skill:'全息力场', desc:'定时恢复自身并补充护盾。必杀为全队展开力场。', color:'#7ec5d9', rarity:4, behavior:'regenshield' },
    { id:'wintermelon', name:'冰西瓜投手', role:'attack', element:'水', hp:780, atk:134, interval:2.35, range:1000, unlock:5, skill:'寒冬轰炸', desc:'冰西瓜溅射附近三路敌人并减速。必杀伤害并冻结全场。', color:'#75bbd6', rarity:4, behavior:'icesplash' },
    { id:'coconut', name:'椰子加农炮', role:'attack', element:'土', hp:920, atk:290, interval:4.3, range:1000, unlock:5, skill:'椰炮齐鸣', desc:'发射重炮，命中后溅射附近敌人。必杀轰炸并击退全场。', color:'#a58158', rarity:4, behavior:'cannon' },
    { id:'primalpea', name:'原始豌豆射手', role:'attack', element:'木', hp:820, atk:98, interval:1.65, range:1000, unlock:6, skill:'原始冲击', desc:'豌豆击退敌人，偶尔使其短暂定身。必杀强力击退整条路。', color:'#89a750', rarity:4, behavior:'knockback' },
    { id:'electricpea', name:'电能豌豆射手', role:'attack', element:'雷', hp:810, atk:84, interval:1.65, range:1000, unlock:7, skill:'电能风暴', desc:'电球穿透同路敌人，命中时溅射邻路。必杀电击全场并定身。', color:'#80d7b6', rarity:5, behavior:'electric' }
  ];
  const Campaign=typeof module!=='undefined'&&module.exports?require('./campaign.js'):root.Campaign;
  const worlds=Campaign.worlds,MAX_LEVEL=60,STARTERS=['pea','sunflower','wallnut'];
  const grade=p=>p.rarity>=4?'SSR':p.rarity===3?'SR':'R';
  const fragmentCost=p=>({R:40,SR:100,SSR:240})[grade(p)];
  const byId = Object.fromEntries(plants.map(p=>[p.id,p]));
  const roleNames = {attack:'勇敢 · 攻击',heal:'温柔 · 治疗',defend:'坚韧 · 防御'};
  function defaultSave(){return {version:2,coins:800,gems:300,tickets:3,shards:0,essence:5,owned:[...STARTERS],fragments:Object.fromEntries(plants.map(p=>[p.id,0])),levels:Object.fromEntries(plants.map(p=>[p.id,1])),stars:Object.fromEntries(plants.map(p=>[p.id,p.rarity])),cleared:{},team:['pea','wallnut',null,null,null,null,'sunflower'],cartLane:0,selectedStage:0,bestEndless:0,sound:true,auto:true,worldAccess:[],draws:{premium:0,pity:0,history:[],normalDay:'',normalFree:0,normalNext:0,premiumNext:0},daily:{day:'',claimDay:'',streak:0,kills:0,clears:0,draws:0,claimed:[]},starClaims:[]};}
  function validateSave(input){
    if(!input||typeof input!=='object'||![1,2].includes(input.version))throw new Error('这不是有效的全明星存档');
    const s=defaultSave(),num=(n,min,max,f)=>Number.isFinite(n)?Math.floor(Math.max(min,Math.min(max,n))):f;
    for(const key of ['coins','gems','tickets','shards','essence'])s[key]=num(input[key],0,9999999,key==='gems'&&input.version===1?300:s[key]);
    for(const p of plants){s.levels[p.id]=num(input.levels?.[p.id],1,MAX_LEVEL,1);s.stars[p.id]=num(input.stars?.[p.id],p.rarity,6,p.rarity);s.fragments[p.id]=num(input.fragments?.[p.id],0,99999,0);}
    if(input.version===1){
      const completed=Object.keys(input.cleared||{}).filter(i=>+i>=0&&+i<15&&input.cleared[i]>0).length;
      s.owned=plants.filter(p=>p.unlock===0||completed>=p.unlock||input.team?.includes(p.id)||s.levels[p.id]>1).map(p=>p.id);
      const migrate=i=>i<5?i:i<10?worlds[3].start+i-5:worlds[4].start+i-10;
      for(let i=0;i<15;i++)if(input.cleared?.[i])s.cleared[migrate(i)]=num(input.cleared[i],1,3,1);
      s.worldAccess=['frontyard'];if(completed>=5)s.worldAccess.push('egypt');if(completed>=10)s.worldAccess.push('pirate');
      s.selectedStage=migrate(num(input.selectedStage,0,14,0));
    }else{
      s.owned=[...new Set([...STARTERS,...(Array.isArray(input.owned)?input.owned.filter(id=>byId[id]):[])])];
      for(let i=0;i<Campaign.total;i++)if(input.cleared?.[i])s.cleared[i]=num(input.cleared[i],1,3,1);
      s.worldAccess=(Array.isArray(input.worldAccess)?input.worldAccess:[]).filter(id=>worlds.some(w=>w.id===id));s.selectedStage=num(input.selectedStage,0,Campaign.total-1,0);
    }
    const seen=new Set();if(Array.isArray(input.team))s.team=Array.from({length:7},(_,i)=>{const id=input.team[i];if(s.owned.includes(id)&&!seen.has(id)){seen.add(id);return id;}return null;});
    s.cartLane=num(input.cartLane,0,2,0);s.bestEndless=num(input.bestEndless,0,999,0);s.sound=input.sound!==false;s.auto=input.auto===true;
    if(!Campaign.stageOpen(s,s.selectedStage))s.selectedStage=Campaign.next(s,0);
    const draws=input.draws||{};for(const key of ['premium','pity','normalFree','normalNext','premiumNext'])s.draws[key]=num(draws[key],0,key==='pity'?29:key==='normalFree'?3:9999999999999,0);
    s.draws.normalDay=typeof draws.normalDay==='string'?draws.normalDay.slice(0,10):'';
    s.draws.history=(Array.isArray(draws.history)?draws.history:[]).filter(r=>r&&byId[r.id]&&['normal','premium'].includes(r.banner)&&Number.isFinite(r.time)).slice(0,30).map(r=>({id:r.id,grade:grade(byId[r.id]),banner:r.banner,time:num(r.time,0,9999999999999,0),fresh:r.fresh===true,pity:r.pity===true,fragments:num(r.fragments,0,100,0)}));
    const daily=input.daily||{};for(const key of ['day','claimDay'])s.daily[key]=typeof daily[key]==='string'?daily[key].slice(0,10):'';
    for(const key of ['streak','kills','clears','draws'])s.daily[key]=num(daily[key],0,999999,0);s.daily.claimed=(Array.isArray(daily.claimed)?daily.claimed:[]).filter(id=>['clear','kill','draw'].includes(id));
    s.starClaims=(Array.isArray(input.starClaims)?input.starClaims:[]).filter(id=>typeof id==='string'&&/^\d+-\d+$/.test(id)).slice(0,100);
    return s;
  }
  function stats(id,save) {const p=byId[id],mult=1+(save.levels[id]-1)*.13+(save.stars[id]-p.rarity)*.22;return {hp:Math.round(p.hp*mult),atk:Math.round(p.atk*mult)};}
  const FIELD={width:1100,height:600,left:178,top:110,columns:7,cellWidth:120,rowHeight:140,rearX:238,frontX:358,cartX:110,baseline:224};
  const data={plants,byId,worlds,Campaign,MAX_LEVEL,STARTERS,grade,fragmentCost,roleNames,FIELD,defaultSave,validateSave,stats};
  if(typeof module!=='undefined'&&module.exports) module.exports=data; else root.GameData=data;
})(typeof window!=='undefined'?window:this);
