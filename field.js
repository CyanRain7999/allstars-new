(function(root){
  'use strict';
  const F=GameData.FIELD;
  function rounded(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
  function background(c,state,art,formation){
    const world=GameData.worlds[state.world],yard=world.texture==='frontyard',egypt=world.texture==='egypt';
    const sky=c.createLinearGradient(0,0,0,130);sky.addColorStop(0,yard?'#96c9b2':egypt?'#e7c997':'#acc8ca');sky.addColorStop(1,yard?'#d1e3a9':egypt?'#f0dba6':'#d4dec5');c.fillStyle=sky;c.fillRect(0,0,F.width,F.height);
    // A horizon and a single fence sit above the lanes; no stretched square grid.
    c.fillStyle=yard?'#6d9659':egypt?'#cfab71':'#91aaa3';c.beginPath();c.moveTo(0,84);for(let x=0;x<=1100;x+=35)c.lineTo(x,73+Math.sin(x*.019)*10);c.lineTo(1100,115);c.lineTo(0,115);c.closePath();c.fill();
    c.fillStyle=yard?'#e2e2be':egypt?'#dfc18c':'#c3b898';c.fillRect(0,92,1100,5);c.fillRect(0,73,1100,4);
    for(let x=10;x<1100;x+=31){c.fillStyle=yard?'#f2edcd':egypt?'#e3c794':'#d4c9aa';c.beginPath();c.moveTo(x,98);c.lineTo(x,68);c.lineTo(x+9,62);c.lineTo(x+18,68);c.lineTo(x+18,98);c.closePath();c.fill();c.fillStyle='#5a593318';c.fillRect(x+13,70,5,28);}
    c.fillStyle=yard?'#89a45c':egypt?'#d5bb86':'#ad9d78';c.fillRect(0,103,1100,497);
    c.fillStyle=yard?'#446943':egypt?'#a78753':'#666d55';rounded(c,F.left-10,F.top-10,F.cellWidth*F.columns+20,F.rowHeight*3+20,10);
    const bg=art[world.texture],palette=yard?['#88b650','#94bc57']:egypt?['#d5b77d','#dcc38f']:['#a59068','#b6a27d'];
    for(let row=0;row<3;row++)for(let col=0;col<F.columns;col++){
      const x=F.left+col*F.cellWidth,y=F.top+row*F.rowHeight;
      c.fillStyle=palette[(row+col)%2];c.fillRect(x,y,F.cellWidth,F.rowHeight);
      // Crop individual ground tiles from the existing texture, keeping the new
      // geometry in charge. Texture marks do not define the hit areas.
      if(bg?.complete&&bg.naturalWidth){c.save();c.globalAlpha=yard?.18:.29;const sw=bg.naturalWidth/3,sh=bg.naturalHeight/3;c.drawImage(bg,col%3*sw,row*sh,sw,sh,x,y,F.cellWidth,F.rowHeight);c.restore();}
      c.fillStyle=(row+col)%2?'#fff7c305':'#24460c09';c.fillRect(x,y,F.cellWidth,F.rowHeight);
      c.strokeStyle=yard?'#4c79342b':'#7563412b';c.lineWidth=1;c.strokeRect(x+.5,y+.5,F.cellWidth-1,F.rowHeight-1);
      if(col<2){c.fillStyle=formation?'#efffba10':'#efffba05';c.fillRect(x+2,y+2,F.cellWidth-4,F.rowHeight-4);}
      if(yard){c.strokeStyle='#486e2326';c.lineWidth=1;for(let i=0;i<5;i++){const px=x+16+(i*29+row*19+col*7)%91,py=y+22+(i*37+col*19)%98;c.beginPath();c.moveTo(px-3,py-3);c.lineTo(px,py+2);c.lineTo(px+2,py-6);c.stroke();}}
      if(!yard&&!egypt){c.strokeStyle='#64553938';c.beginPath();c.moveTo(x+4,y+45);c.lineTo(x+F.cellWidth-4,y+45);c.moveTo(x+4,y+92);c.lineTo(x+F.cellWidth-4,y+92);c.stroke();}
    }
    // Planting columns use the same 120 x 140 cells as the engine and buttons.
    c.strokeStyle='#dce99b66';c.lineWidth=2;c.beginPath();c.moveTo(F.left+F.cellWidth*2,F.top+2);c.lineTo(F.left+F.cellWidth*2,F.top+F.rowHeight*3-2);c.stroke();
    c.fillStyle=yard?'#c3cb9c':egypt?'#e0c79c':'#c6bda0';rounded(c,65,109,87,421,8);
    c.strokeStyle='#807f5440';c.lineWidth=1;for(let y=129;y<526;y+=27){c.beginPath();c.moveTo(68,y);c.lineTo(149,y);c.stroke();}
    c.fillStyle='#5b7040';rounded(c,21,111,30,420,7);c.textAlign='center';c.font='bold 12px Microsoft YaHei';c.fillStyle='#e2e9b5';for(let i=0;i<3;i++)c.fillText(['上','中','下'][i],36,F.top+F.rowHeight*(i+.5)+5);
    c.fillStyle='#718756';rounded(c,1043,109,38,421,8);c.fillStyle='#ced9b3';c.font='11px Microsoft YaHei';c.fillText('入',1062,308);c.fillText('口',1062,326);
    c.fillStyle=yard?'#78964c':egypt?'#bca16b':'#8a7e60';c.fillRect(0,550,1100,50);c.fillStyle='#eef3d1';c.font='12px Microsoft YaHei';c.fillText('板车支援',110,575);c.fillText('后排 · 输出 / 治疗',F.rearX,575);c.fillText('前排 · 防御',F.frontX,575);c.fillStyle='#eef3d1aa';c.fillText('← 僵尸来袭',850,575);
    c.fillStyle='#344d2420';c.fillRect(0,594,1100,6);
  }
  root.LawnView={background};
})(window);
