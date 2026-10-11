const size=37,dataCount=108,eccCount=26;
const gfMul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11d);z^=((y>>>i)&1)*x}return z};
function rsGenerator(degree){let p=[1],root=1;for(let i=0;i<degree;i++){const next=Array(p.length+1).fill(0);p.forEach((v,j)=>{next[j]^=v;next[j+1]^=gfMul(v,root)});p=next;root=gfMul(root,2)}return p}
function ecc(data){const gen=rsGenerator(eccCount),r=Array(eccCount).fill(0);for(const b of data){const f=b^r.shift();r.push(0);for(let i=0;i<eccCount;i++)r[i]^=gfMul(gen[i+1],f)}return r}
const bit=(a,v,n)=>{for(let i=n-1;i>=0;i--)a.push((v>>>i)&1)};
function formatBits(mask){const value=(1<<3)|mask;let rem=value<<10;for(let i=14;i>=10;i--)if((rem>>>i)&1)rem^=0x537<<(i-10);return((value<<10)|rem)^0x5412}
export function qrSvg(text){
 const bytes=[...new TextEncoder().encode(text)];if(bytes.length>106)return "";
 const bits=[];bit(bits,4,4);bit(bits,bytes.length,8);bytes.forEach(v=>bit(bits,v,8));
 for(let i=0;i<Math.min(4,dataCount*8-bits.length);i++)bits.push(0);
 while(bits.length%8)bits.push(0);
 const words=[];for(let i=0;i<bits.length;i+=8){let v=0;for(let j=0;j<8;j++)v=(v<<1)|bits[i+j];words.push(v)}
 for(let pad=0;words.length<dataCount;pad++)words.push(pad%2?0x11:0xec);
 const all=words.concat(ecc(words));
 const matrix=Array.from({length:size},()=>Array(size).fill(false));
 const reserved=Array.from({length:size},()=>Array(size).fill(false));
 const set=(r,c,v)=>{if(r>=0&&r<size&&c>=0&&c<size){matrix[r][c]=!!v;reserved[r][c]=true}};
 function finder(top,left){for(let dy=-1;dy<=7;dy++)for(let dx=-1;dx<=7;dx++){const r=top+dy,c=left+dx;const inside=dy>=0&&dy<=6&&dx>=0&&dx<=6;const dark=inside&&(dy===0||dy===6||dx===0||dx===6||(dy>=2&&dy<=4&&dx>=2&&dx<=4));set(r,c,dark)}}
 finder(0,0);finder(0,size-7);finder(size-7,0);
 for(let i=8;i<size-8;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
 for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(30+dy,30+dx,Math.max(Math.abs(dy),Math.abs(dx))!==1);
 const fmt=formatBits(0);
 for(let i=0;i<=5;i++)set(i,8,(fmt>>>i)&1);
 set(7,8,(fmt>>>6)&1);set(8,8,(fmt>>>7)&1);set(8,7,(fmt>>>8)&1);
 for(let i=9;i<15;i++)set(8,14-i,(fmt>>>i)&1);
 for(let i=0;i<8;i++)set(8,size-1-i,(fmt>>>i)&1);
 for(let i=8;i<15;i++)set(size-15+i,8,(fmt>>>i)&1);
 set(size-8,8,true);
 let index=0,up=true;
 for(let right=size-1;right>=1;right-=2){
   if(right===6)right=5;
   for(let vert=0;vert<size;vert++){
     const r=up?size-1-vert:vert;
     for(let j=0;j<2;j++){const c=right-j;if(!reserved[r][c]){const raw=index<all.length*8?((all[index>>>3]>>>(7-(index&7)))&1):0;matrix[r][c]=!!(raw^((r+c)%2===0?1:0));index++}}
   }
   up=!up;
 }
 const quiet=4,total=size+quiet*2;let path="";
 for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(matrix[r][c])path+="M"+(c+quiet)+" "+(r+quiet)+"h1v1h-1z";
 return'<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+total+' '+total+'" role="img" aria-label="QR code for this Career DNA result"><rect width="100%" height="100%" fill="#fff"/><path d="'+path+'" fill="#172424"/></svg>';
}
const esc=s=>String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
export function renderPrintCard({profile,dna,results,code,description,labels}){
 const frontTop=results.top.slice(0,3),discover=results.discovery.slice(0,3);
 const bars=dna.riasec.map(x=>'<div class="card-ria"><span>'+x.key+'</span><div><i style="width:'+Math.max(7,x.value*16)+'%"></i></div></div>').join("");
 const traits=dna.topTraits.slice(0,6).map(t=>'<span>'+esc(t)+'</span>').join("");
 const top=frontTop.map((c,i)=>'<li><span class="rank-dot">'+(i+1)+'</span>'+esc(c.name)+'</li>').join("");
 const surprise=discover.map(c=>'<li>'+esc(c.name)+'</li>').join("");
 const summary=esc(description);
 const url=new URL(location.href);url.searchParams.set("code",code);url.hash="";
 let link=url.toString();if(link.length>106)link=location.origin+"/?code="+encodeURIComponent(code);
 const qr=qrSvg(link)||qrSvg(location.origin+"/?code="+encodeURIComponent(code));
 return'<article class="print-card card-front"><header><span>✳ CAREER EXPLORER</span><small>YOUR PERSONAL MAP</small></header><h1>CAREER DNA</h1><h2>THE '+esc(dna.type.toUpperCase())+'</h2><p class="card-intro">A snapshot of what sparks your curiosity.</p><h3>YOUR STRONGEST TRAITS</h3><div class="card-traits">'+traits+'</div><div class="card-columns"><section><h3>RIASEC PROFILE</h3>'+bars+'</section><section><h3>CAREERS TO EXPLORE</h3><ol>'+top+'</ol></section></div><footer>Your Career DNA is a starting point for exploration, not a prediction of your future.</footer></article><article class="print-card card-back"><div class="back-orbit">✳</div><header><span>THE CURIOUS NEXT STEP</span><small>CAREER DNA CARD · BACK</small></header><h2>Careers you may not have considered</h2><ul>'+surprise+'</ul><p class="card-summary">'+summary+'</p><div class="card-code"><div><small>YOUR PRIVATE RETRIEVAL CODE</small><strong>'+esc(code)+'</strong><p>Stored in this browser only</p></div>'+qr+'</div><footer>Scan to open this profile on this device. Keep exploring; your interests can grow and change.</footer></article>';
}

