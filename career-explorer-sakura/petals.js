/* A sparse background layer: slow falls, shared wind, and independent flutter. */
(()=>{
  const canvas=document.createElement('canvas');
  canvas.id='sakura-petals';canvas.setAttribute('aria-hidden','true');
  document.body.prepend(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,petals=[],frame=0,last=0,elapsed=0,printing=false;
  const random=(min,max)=>min+Math.random()*(max-min);
  function create(scatter=false){return{x:random(-35,width+35),y:scatter?random(-height*.2,height):-25,size:random(3,7),speed:random(13,26),phase:random(0,Math.PI*2),spin:random(-.38,.38),angle:random(0,Math.PI*2),alpha:random(.2,.4)}}
  function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);petals=Array.from({length:width<600?11:24},()=>create(true));}
  function draw(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(p.size,p.size*(.48+.22*Math.sin(elapsed*.8+p.phase)));ctx.globalAlpha=p.alpha;ctx.fillStyle='#d581a0';ctx.beginPath();ctx.moveTo(0,-1);ctx.bezierCurveTo(.72,-.85,1.05,-.18,.7,.42);ctx.bezierCurveTo(.44,.93,.08,1.15,0,1.2);ctx.bezierCurveTo(-.65,.85,-.94,.18,-.63,-.42);ctx.bezierCurveTo(-.42,-.92,-.15,-.66,0,-1);ctx.fill();ctx.restore();}
  function tick(now){frame=requestAnimationFrame(tick);if(now-last<1000/30)return;const dt=last?Math.min((now-last)/1000,.06):1/30;last=now;elapsed+=dt;ctx.clearRect(0,0,width,height);
    // The wind changes smoothly; no cursor chasing or sudden bursts.
    const wind=8+Math.sin(elapsed*.16)*9+Math.pow(Math.max(0,Math.sin(elapsed*.29)),3)*14;
    for(const p of petals){p.x+=(wind+Math.sin(elapsed*.7+p.phase)*9)*dt;p.y+=p.speed*dt;p.angle+=p.spin*dt;
      if(p.y>height+25){Object.assign(p,create());}if(p.x>width+30)p.x=-25;if(p.x< -35)p.x=width+25;draw(p);}
  }
  function sync(){cancelAnimationFrame(frame);last=0;const off=reduced.matches||document.hidden||printing;canvas.hidden=off;if(!off)frame=requestAnimationFrame(tick);else ctx.clearRect(0,0,width,height);}
  let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,150)});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  addEventListener('beforeprint',()=>{printing=true;sync()});addEventListener('afterprint',()=>{printing=false;sync()});
  resize();sync();
})();

