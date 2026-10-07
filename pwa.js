(function(root){
  'use strict';let registration=null,installPrompt=null,ready=false,message='正在准备离线资源…';
  const label=text=>{const el=document.getElementById('pwa-status');if(el)el.textContent=text;};
  function check(){if(!registration?.active)return;const channel=new MessageChannel();channel.port1.onmessage=e=>{ready=e.data.ready===true;message=ready?'离线资源已准备好。断网后可继续游玩；存档保留在当前浏览器。':'离线资源还未准备完，请保持页面打开。';label(ready?'✓ 可离线游玩':'准备离线资源…');};registration.active.postMessage({type:'CACHE_STATUS'},[channel.port2]);}
  root.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
  root.addEventListener('appinstalled',()=>{installPrompt=null;label('✓ 已安装 / 离线可玩');});
  root.addEventListener('online',()=>check());root.addEventListener('offline',()=>label(ready?'离线游玩中':'当前离线'));
  if(location.protocol==='file:'){message='双击文件可以游玩；PWA 安装需要打开 localhost 或 GitHub Pages 的 HTTPS 地址。';label('本地文件版');}
  else if('serviceWorker' in navigator&&root.isSecureContext){
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
      registration=reg;label('准备离线资源…');if(reg.active)check();
      const notice=()=>{if(reg.waiting){root.dispatchEvent(new Event('game-update-ready'));label('新版本已就绪');}};
      notice();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',()=>{if(reg.installing?.state==='installed'){if(navigator.serviceWorker.controller)notice();else navigator.serviceWorker.ready.then(check);}if(reg.installing?.state==='redundant'){message='离线资源下载未完成，联网刷新后会重试。';label('离线准备未完成');}}));
      navigator.serviceWorker.ready.then(check);
    }).catch(()=>{message='离线准备失败。保持联网刷新后可重试；当前游戏仍可在线游玩。';label('离线准备未完成');});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(root.__allstarsUpdating)location.reload();else check();});
  }else{message='当前浏览器环境未开启 PWA 支持。可继续玩，或在 HTTPS 地址使用支持 PWA 的浏览器。';label('浏览器模式');}
  root.GamePWA={status:()=>message,hasUpdate:()=>!!registration?.waiting,update:()=>{if(!registration?.waiting)return;root.__allstarsUpdating=true;registration.waiting.postMessage({type:'SKIP_WAITING'});},install:async toast=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;return;}if(matchMedia('(display-mode: standalone)').matches){toast('游戏已经安装。');return;}toast(location.protocol==='file:'?'打开在线版后，在浏览器菜单中选择“安装应用”。':'在浏览器菜单选择“安装应用”或“添加到主屏幕”；iPhone 使用 Safari 的分享菜单。');}};
})(window);
