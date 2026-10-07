(function(root){
  'use strict';
  // Old All Stars world order and level counts. Encounters and dialogue are
  // reconstructed here; they are not original-client scripts.
  const definitions=[
    ['frontyard','美国小镇',15,'☀','#75a64b','守住戴夫的后院','豌豆、向日葵和坚果，三位老朋友重新出发。','街角来客','后院告急','巨人的脚步','frontyard'],
    ['primitive','原始部落',20,'♨','#7e9149','穿过远古丛林','时空裂缝把我们带到了远古。小心躲在草丛里的部落僵尸。','部落哨兵','远古围猎','猛犸的足迹','frontyard'],
    ['greatwall','万里长城',25,'▥','#889174','守卫万里长城','城墙上响起战鼓。守住关隘，别让僵尸军团突破防线。','关隘守卫','战车来袭','城墙决战','egypt'],
    ['egypt','神秘埃及',30,'△','#d5af63','唤醒沙海中的力量','金字塔的影子里，木乃伊正在醒来。戴夫的旅程还没有结束。','古墓入口','沙漠风暴','法老的军团','egypt'],
    ['pirate','海盗湾',30,'⚓','#59a5b9','登上僵尸的海盗船','海风带来了新的敌人。船长的宝藏就在航线尽头。','海盗登陆','火药与铁桶','船长的挑战','pirate'],
    ['west','狂野西部',30,'★','#bf8b57','在西部追赶落日','沙尘中的脚步越来越近。把板车开到最需要支援的地方。','荒野追踪','落日警报','西部决斗','egypt'],
    ['kongfu','功夫世界',30,'☯','#93ad66','翻过功夫的山门','练功场上来了不速之客。菜问已经准备好再打一场。','山门初见','竹林阵法','武馆决战','frontyard'],
    ['journey','西游记',30,'☁','#ae91c4','踏上云端取经路','这一次，僵尸也来到了云海。让伙伴们一起守住西行的路。','云海来客','妖风四起','西行之战','frontyard'],
    ['viking','维京世界',30,'⚒','#7eafbd','在北海迎接最后的挑战','冰冷的海风里响起号角。集齐你的伙伴，守住这一场远征。','北海号角','冰原围城','维京之王','pirate']
  ];
  let offset=0;
  const worlds=definitions.map((d,index)=>{const w={id:d[0],name:d[1],count:d[2],icon:d[3],color:d[4],subtitle:d[5],note:d[6],index,start:offset,texture:d[10]};w.levels=Array.from({length:w.count},(_,n)=>n===0?'启程 · '+w.name:(n+1)%5===0?(n===w.count-1?d[9]:d[8]):d[7]+' '+(n+1));offset+=w.count;return w;});
  const stages=worlds.flatMap(w=>w.levels.map((name,local)=>({index:w.start+local,world:w.index,local,name,label:(w.index+1)+'-'+(local+1),boss:(local+1)%5===0,lanes:w.index===0&&local<2?[0]:w.index===0&&local<5?[0,1]:[0,1,2],waves:w.index===0&&local<2?2:3,scale:w.index===0&&local<5?.48+local*.1:1+w.index*.65+local/w.count*.65,recommended:1+w.index*5+Math.floor(local/6),story:local===0?w.note:(local+1)%5===0?'前面是这一段旅程的守卫。照顾好你的前排，准备迎战！':'继续向前，新的伙伴和奖励就在下一片草坪。'})));
  function get(index){return stages[Math.max(0,Math.min(stages.length-1,index))];}
  function worldOpen(save,index){return index===0||!!save.cleared[worlds[index-1].start+worlds[index-1].count-1]||save.worldAccess?.includes(worlds[index].id);}
  function stageOpen(save,index){const stage=get(index),world=worlds[stage.world];return worldOpen(save,stage.world)&&(stage.local===0||!!save.cleared[index-1]);}
  function next(save,wi){const w=worlds[wi];return stages.slice(w.start,w.start+w.count).find(s=>stageOpen(save,s.index)&&!save.cleared[s.index])?.index??w.start;}
  const api={worlds,stages,get,worldOpen,stageOpen,next,total:stages.length};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Campaign=api;
})(typeof window!=='undefined'?window:this);
