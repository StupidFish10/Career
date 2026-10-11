import{questions}from"./questions.js";
import{buildProfile,buildResults}from"./scoring.js";
import{makeDna,dnaDescription,makeCode}from"./dna.js";
import{advisorReply,attachCareerSummaries}from"./advisor.js";
import{renderPrintCard}from"./card.js";

const root=document.querySelector("#app");
const dialog=document.querySelector("#code-dialog");
const careerDialog=document.querySelector("#career-dialog");
const compareDialog=document.querySelector("#compare-dialog");
const state={answers:Array(questions.length).fill(null),step:0,careers:[],labels:{},profile:null,dna:null,results:null,code:"",compare:new Set(),messages:[],search:""};
const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const codeKey=code=>"career-explorer-result:"+code.replaceAll("-","").toUpperCase();
const label=(group,key)=>state.labels[group]?.[key]||key;
const careerIcon=c=>({"Technology":"⌘","Emerging technology":"✳","Engineering":"⚙","Design":"✦","Environment":"🌿","Business":"↗","Science":"⌕","Healthcare":"♡","Education":"✎","Media":"◉","Law":"§","Government":"◇","Finance":"↗","Social sciences":"◌","Skilled trades":"⚒","Culture":"▧"}[c.category]||"✳");
function toast(message){const el=document.querySelector("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function setView(view){state.view=view;render();window.scrollTo(0,0)}
function saveCurrent(){
  const record={version:1,code:state.code,answers:state.answers,createdAt:new Date().toISOString()};
  try{localStorage.setItem(codeKey(state.code),JSON.stringify(record));return true}catch{return false}
}
function loadCode(code){
  const normalized=String(code||"").replace(/[^a-z0-9]/gi,"").toUpperCase();
  if(normalized.length!==8)return null;
  try{const raw=localStorage.getItem(codeKey(normalized));return raw?JSON.parse(raw):null}catch{return null}
}
function finish(){
  state.profile=buildProfile(state.answers,questions);
  state.dna=makeDna(state.profile);
  state.results=buildResults(state.profile,state.careers,state.labels);
  state.code=makeCode();
  let saved=false;
  for(let tries=0;tries<5&&!saved;tries++){saved=saveCurrent();if(!saved)state.code=makeCode()}
  state.messages=[];
  const url=new URL(location.href);url.searchParams.set("code",state.code);history.replaceState({}, "",url);
  setView("results");
  if(!saved)toast("Profile is ready, but this browser could not save its retrieval code.");
}
function retrieveCode(value){
  const result=loadCode(value);
  if(!result){toast("That code isn't saved in this browser yet.");return}
  state.answers=result.answers;
  state.profile=buildProfile(state.answers,questions);
  state.dna=makeDna(state.profile);
  state.results=buildResults(state.profile,state.careers,state.labels);
  state.code=result.code;
  state.messages=[];
  dialog.close();
  const url=new URL(location.href);url.searchParams.set("code",state.code);history.replaceState({}, "",url);
  setView("results");
}
function goHome(){state.compare.clear();setView("home");history.replaceState({}, "",location.pathname)}
function startAssessment(){state.answers=Array(questions.length).fill(null);state.step=0;state.compare.clear();state.messages=[];setView("assessment")}
function progressMarkup(){
  const q=questions[state.step],done=state.answers.filter(x=>x!==null).length;
  const areas=[["Interests",6],["Strengths",4],["Work style",4],["School subjects",4]];
  let preceding=0,area=q.area,local=state.step+1;
  for(const [name,count]of areas){if(state.step>=preceding&&state.step<preceding+count){area=name;local=state.step-preceding+1;break}preceding+=count}
  return'<div class="assessment-progress"><div class="progress-copy"><span>'+esc(area)+'</span><span>Question '+(state.step+1)+' of 18</span></div><div class="progress-track"><i style="width:'+((state.step+1)/18*100)+'%"></i></div><div class="step-dots">'+areas.map(([name,count],index)=>'<span class="'+(name===area?"active":"")+'">'+esc(name)+(name===area?' <b>'+local+'/'+count+'</b>':"")+'</span>').join("")+'</div></div>';
}
function homeView(){
 return'<section class="landing"><div class="landing-copy"><span class="eyebrow"><i></i> YOUR NEXT CHAPTER STARTS WITH CURIOSITY</span><h1>Find a career<br>that feels like <em>you.</em></h1><p class="lead">A little curiosity can take you somewhere unexpected. Explore careers that connect with what you enjoy, what you’re good at, and how you like to work.</p><div class="landing-actions"><button class="button button-dark button-large" data-action="start">Discover my Career DNA <span>↗</span></button><button class="text-button" data-action="saved-code">I already have a code <span>→</span></button></div><div class="trust-line"><span class="tiny-avatars">✦　◉　✿</span><span>18 quick questions · No name or email needed</span></div></div><div class="landing-art" aria-label="Illustration of a map with different career paths"><div class="sun-orbit"></div><div class="path path-one"></div><div class="path path-two"></div><div class="art-sticker sticker-top">YOUR CURIOSITY<br>IS A CLUE <b>↗</b></div><div class="art-sticker sticker-bottom">MANY WAYS<br>TO MAKE A MARK <b>✳</b></div><div class="art-center"><span>✳</span><strong>YOUR<br>FUTURE<br>IS OPEN</strong></div><div class="art-chip chip-one">🧪 <span>the explorer</span></div><div class="art-chip chip-two">🎨 <span>the creator</span></div><div class="art-chip chip-three">⚙ <span>the builder</span></div><div class="art-chip chip-four">🌱 <span>the helper</span></div></div></section><section class="how-strip"><div><span class="strip-number">01</span><b>Answer in your own way</b><small>Pick what sparks your curiosity.</small></div><div><span class="strip-number">02</span><b>Meet your Career DNA</b><small>See a snapshot of your strengths.</small></div><div><span class="strip-number">03</span><b>Explore what’s possible</b><small>Find familiar and unexpected paths.</small></div></section><section class="home-note"><span class="note-spark">✳</span><p><strong>Think of this as a map, not a verdict.</strong> Career Explorer offers ideas to investigate. Your interests can grow, and you’re always the one choosing what comes next.</p><button class="link-button" data-action="start">Let’s explore <span>↗</span></button></section>';
}
function assessmentView(){
 const q=questions[state.step],selected=state.answers[state.step],last=state.step===questions.length-1;
 return'<section class="assessment-shell"><button class="back-home" data-action="home">← <span>Back to home</span></button>'+progressMarkup()+'<div class="question-card"><div class="question-kicker"><span class="question-icon">'+(state.step<6?"✳":state.step<10?"✦":state.step<14?"◌":"▧")+'</span><span>GO WITH YOUR FIRST INSTINCT</span></div><h1>'+esc(q.prompt)+'</h1><p class="question-hint">There are no right answers. Choose the one that feels most interesting to you.</p><div class="answer-grid" role="radiogroup" aria-label="'+esc(q.prompt)+'">'+q.options.map((o,i)=>'<button class="answer-option '+(selected===i?"selected":"")+'" data-answer="'+i+'" role="radio" aria-checked="'+(selected===i)+'"><span class="option-icon">'+esc(o.icon)+'</span><span>'+esc(o.text)+'</span><span class="option-check">'+(selected===i?"✓":"↗")+'</span></button>').join("")+'</div><div class="question-footer"><button class="button button-quiet" data-action="back" '+(state.step===0?"disabled":"")+'><span>←</span> Back</button><span class="answer-note">'+(selected===null?"Pick one to continue":"Saved — change it any time")+'</span><button class="button button-dark" data-action="next" '+(selected===null?"disabled":"")+'>'+(last?"See my Career DNA":"Next question")+' <span>→</span></button></div></div><p class="privacy-line">🔒 Your answers stay private in this browser. No personal details are requested.</p></section>';
}
function radarSvg(dna){
 const points=dna.dimensions,n=points.length,cx=150,cy=132,max=92;
 const xy=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]};
 const rings=[.25,.5,.75,1].map(s=>'<polygon points="'+points.map((_,i)=>xy(i,max*s).join(",")).join(" ")+'" fill="none" stroke="#dfe5df" stroke-width="1"/>').join("");
 const axes=points.map((_,i)=>{const [x,y]=xy(i,max);return'<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="#e5e9e3"/>'}).join("");
 const poly=points.map((p,i)=>xy(i,max*p.value/100).join(",")).join(" ");
 const labelsSvg=points.map((p,i)=>{const [x,y]=xy(i,max+18);return'<text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="middle">'+esc(p.name)+'</text>'}).join("");
 return'<svg class="radar" viewBox="0 0 300 264" role="img" aria-label="Eight Career DNA dimensions shown in a radar chart">'+rings+axes+'<polygon points="'+poly+'" fill="#bbd86c" fill-opacity=".48" stroke="#56823e" stroke-width="2.5"/>'+points.map((p,i)=>{const [x,y]=xy(i,max*p.value/100);return'<circle cx="'+x+'" cy="'+y+'" r="3.2" fill="#416a38"/>'}).join("")+labelsSvg+'</svg>';
}
function riaBars(dna){
 const max=Math.max(1,...dna.riasec.map(x=>x.value));
 const names={R:"Realistic",I:"Investigative",A:"Artistic",S:"Social",E:"Enterprising",C:"Conventional"};
 return'<div class="ria-list">'+dna.riasec.map(x=>'<div class="ria-row"><span class="ria-letter">'+x.key+'</span><span class="ria-name">'+names[x.key]+'</span><span class="ria-track"><i style="width:'+Math.max(3,x.value/max*100)+'%"></i></span></div>').join("")+'</div>';
}
function dimensionsMarkup(dna){
 return'<div class="dimension-list">'+dna.dimensions.map(d=>'<div class="dimension-row"><span>'+esc(d.name)+'</span><div class="dimension-track"><i style="width:'+d.value+'%"></i></div><small>'+d.value+'</small></div>').join("")+'</div>';
}
function careerCard(c,tag){
 return'<article class="career-card"><button class="career-main" data-action="career" data-id="'+esc(c.id)+'"><div class="career-icon">'+careerIcon(c)+'</div><span class="career-info"><span class="career-meta">'+esc(c.category)+(tag?' · '+esc(tag):"")+'</span><strong>'+esc(c.name)+'</strong><span class="career-desc">'+esc(c.description)+'</span></span><span class="score-ring" aria-label="'+c.score+'% compatibility">'+c.score+'<small>%</small></span></button><div class="career-why"><span>WHY IT APPEARED</span><div>'+((c.why&&c.why.length)?c.why.slice(0,3).map(x=>'<span class="why-pill">✓ '+esc(x)+'</span>').join(""):'<span class="why-pill">✳ A mix of your answers</span>')+'</div></div><div class="career-card-actions"><button class="link-button" data-action="career" data-id="'+esc(c.id)+'">Explore this career <span>↗</span></button><button class="icon-action '+(state.compare.has(c.id)?"is-added":"")+'" data-action="toggle-compare" data-id="'+esc(c.id)+'" aria-label="'+(state.compare.has(c.id)?"Remove from":"Add to")+' comparison">'+(state.compare.has(c.id)?"✓":"＋")+'</button></div></article>';
}
function discoverCard(c){
 return'<article class="discovery-card"><span class="discovery-star">✳ A SURPRISE PATH</span><h3>'+esc(c.name)+'</h3><p>'+esc(c.description)+'</p><div class="discovery-reason"><b>Why did you find me?</b><span>'+esc((c.why&&c.why.length?c.why.slice(0,2):["A blend of interests and strengths"]).join(" · "))+'</span></div><div class="discovery-bottom"><span class="mini-score">'+c.score+'% exploration match</span><button class="link-button" data-action="career" data-id="'+esc(c.id)+'">Meet this career ↗</button></div></article>';
}
function browseMarkup(){
 const shown=state.careers.filter(c=>!state.search||[c.name,c.category,c.description].join(" ").toLowerCase().includes(state.search.toLowerCase())).slice(0,12);
 return'<section class="browse-section"><div class="section-heading"><div><span class="eyebrow">THE WHOLE WIDE WORLD OF WORK</span><h2>Browse all careers</h2><p>Search '+state.careers.length+' paths across science, making, people, ideas, and more.</p></div><label class="search-box"><span>⌕</span><input type="search" data-search placeholder="Try “design” or “biology”" value="'+esc(state.search)+'" aria-label="Search careers"></label></div><div class="browse-grid">'+shown.map(c=>'<button class="browse-item" data-action="career" data-id="'+esc(c.id)+'"><span class="browse-icon">'+careerIcon(c)+'</span><span><small>'+esc(c.category)+'</small><b>'+esc(c.name)+'</b></span><span>↗</span></button>').join("")+'</div>'+(state.careers.filter(c=>!state.search||[c.name,c.category,c.description].join(" ").toLowerCase().includes(state.search.toLowerCase())).length>12?'<p class="browse-count">Showing 12 of '+state.careers.filter(c=>!state.search||[c.name,c.category,c.description].join(" ").toLowerCase().includes(state.search.toLowerCase())).length+' matches. Narrow your search to explore more.</p>':"")+'</section>';
}
function chatMarkup(){
 const welcome=state.messages.length?state.messages.map(m=>'<div class="chat-line '+(m.role==="user"?"from-user":"from-guide")+'"><div class="chat-avatar">'+(m.role==="user"?"✦":"✳")+'</div><div class="chat-bubble">'+(m.role==="assistant"?'<small>'+esc(m.source)+'</small>':"")+esc(m.text)+'</div></div>').join(""):'<div class="chat-line from-guide"><div class="chat-avatar">✳</div><div class="chat-bubble"><small>YOUR RESULTS + CAREER GUIDE</small>Your profile is a starting point, not a rulebook. Ask me why a career appeared, or tell me what you enjoy.</div></div>';
 return'<section class="advisor-section" id="advisor"><div class="advisor-intro"><span class="advisor-spark">✳</span><div><span class="eyebrow">A LITTLE MORE CURIOUS?</span><h2>Talk it through</h2><p>A profile-aware guide for questions, comparisons, and low-pressure next steps.</p></div><span class="guided-badge">GUIDED DEMO</span></div><div class="chat-panel"><div class="chat-history" id="chat-history">'+welcome+'</div><div class="prompt-chips"><button data-prompt="Why did you recommend '+esc(state.results.top[0]?.name||"this career")+'?">Why this match?</button><button data-prompt="I like mathematics but do not like coding. What should I explore?">Math, not coding</button><button data-prompt="What should I try before deciding?">What could I try?</button></div><form class="advisor-form" id="advisor-form"><input name="prompt" placeholder="Ask about a career, subject, or interest…" autocomplete="off" required><button class="button button-dark" type="submit" aria-label="Send question">↑</button></form><p class="advisor-disclaimer">Guided suggestions are generated from the profile and career guide on this device. No external AI service is connected in this showcase build. Advice is exploratory, not professional career counseling.</p></div></section>';
}
function resultsView(){
 const dna=state.dna,top=state.results.top;
 return'<section class="results-shell"><div class="results-topbar"><button class="back-home" data-action="home">← <span>Home</span></button><div class="result-tools"><span class="code-chip">DNA CODE <b>'+esc(state.code)+'</b></span><button class="button button-soft" data-action="print">Print my card <span>▣</span></button></div></div><section class="results-hero"><div class="results-hero-copy"><span class="eyebrow"><i></i> YOUR CAREER DNA</span><p class="hero-overline">A fresh perspective on what makes you curious</p><h1>THE <em>'+esc(dna.type.toUpperCase())+'</em></h1><p>'+esc(dnaDescription(dna))+'</p><div class="hero-tags">'+dna.topTraits.slice(0,4).map(t=>'<span>'+esc(t)+'</span>').join("")+'</div><div class="hero-actions"><button class="button button-dark" data-action="browse">Explore careers <span>↓</span></button><button class="text-button" data-action="copy-code">Copy my code ↗</button></div></div><div class="results-orbit"><div class="orbit-label label-top">✳ <span>your interests</span></div><div class="orbit-label label-right">✦ <span>your strengths</span></div><div class="orbit-label label-bottom">◌ <span>your next maybe</span></div><div class="orbit-core"><span>'+careerIcon(top[0]||{category:"Technology"})+'</span><strong>OPEN<br>POSSIBILITIES</strong></div></div></section><div class="results-grid"><section class="insight-card radar-card"><div class="card-heading"><div><span class="eyebrow">A SNAPSHOT, NOT A BOX</span><h2>Your Career DNA</h2></div><span class="little-mark">✳</span></div><p>Eight dimensions based on the patterns in your answers.</p>'+radarSvg(dna)+dimensionsMarkup(dna)+'</section><section class="insight-card ria-card"><div class="card-heading"><div><span class="eyebrow">RIASEC INTERESTS</span><h2>Your interest mix</h2></div><span class="little-mark">◌</span></div><p>Six lenses for the activities that may draw your attention.</p>'+riaBars(dna)+'<div class="riasec-note">RIASEC is one useful way to talk about interests. It does not define who you are.</div></section></div><section class="recommendations-section" id="recommendations"><div class="section-heading"><div><span class="eyebrow">THE FIRST FEW PATHS ON YOUR MAP</span><h2>Careers to explore</h2><p>Compatibility / Exploration Scores show how your answers align with each career description. They are not probabilities or predictions of success.</p></div><span class="result-count">01 — 05</span></div><div class="score-method"><span>✳</span><b>How the score works</b><span>Interests 40% · Strengths 25% · Subjects 15% · Work values 15% · Work setting 5%</span></div><div class="recommendations-grid">'+top.map((c,i)=>careerCard(c,i===0?"Your strongest match":"Also worth a look")).join("")+'</div></section><section class="discovery-section"><div class="discovery-head"><div><span class="eyebrow">A TURN YOU MIGHT NOT EXPECT</span><h2>🤯 Careers you may not have considered</h2><p>Less obvious paths surfaced by combinations in your profile.</p></div><span class="discovery-stamp">STAY<br>CURIOUS ✳</span></div><div class="discovery-grid">'+state.results.discovery.map(discoverCard).join("")+'</div></section><section class="save-banner"><span class="save-mark">✳</span><div><span class="eyebrow">TAKE YOUR PROFILE WITH YOU</span><h2>Your code is '+esc(state.code)+'</h2><p>It can retrieve this profile in this browser. Your result is saved here without a name or contact details.</p></div><button class="button button-dark" data-action="print">Print Career DNA card <span>↗</span></button></section>'+chatMarkup()+browseMarkup()+'<footer class="site-footer"><span>✳ CAREER EXPLORER</span><p>This is a career exploration tool, not a definitive or scientifically validated career test. Scores show how answers align with career descriptions; they do not estimate success or future outcomes.</p><button class="text-button" data-action="saved-code">Retrieve a saved profile</button></footer><div class="compare-dock '+(state.compare.size?"visible":"")+'"><span>'+state.compare.size+' selected'+(state.compare.size===1?" — pick one more":"")+'</span><button class="button button-dark" data-action="compare-open" '+(state.compare.size<2?"disabled":"")+'>Compare careers <span>↗</span></button></div></section>';
}
function render(){root.innerHTML=state.view==="assessment"?assessmentView():state.view==="results"?resultsView():homeView();if(state.view==="results"&&state.messages.length){const h=document.querySelector("#chat-history");if(h)h.scrollTop=h.scrollHeight}}
function openCodeDialog(){
 document.querySelector("#code-dialog-content").innerHTML='<span class="eyebrow">WELCOME BACK, EXPLORER</span><h2>Enter your Career DNA code</h2><p>Profiles are saved in the browser where you completed the assessment.</p><form id="retrieve-form" class="retrieve-form"><input name="code" placeholder="ABCD-1234" maxlength="9" autocomplete="off" aria-label="Career DNA code" required><button class="button button-dark" type="submit">Open my profile ↗</button></form><p class="modal-note">Your code is random and does not contain personal information.</p>';
 dialog.showModal();
}
function careerDetails(id){
 const c=state.careers.find(x=>x.id===id);if(!c)return;
 const related=(c.relatedCareerIds||[]).map(rid=>state.careers.find(x=>x.id===rid)).filter(Boolean);
 const result=state.results?.ranked.find(x=>x.id===id);
 const profileScore=result?'<div class="detail-score"><span>COMPATIBILITY / EXPLORATION SCORE</span><strong>'+result.score+'<small>%</small></strong></div>':'';
 document.querySelector("#career-dialog-content").innerHTML='<span class="eyebrow">'+esc(c.category)+'</span><h2>'+esc(c.name)+'</h2><p class="detail-lead">'+esc(c.description)+'</p>'+profileScore+'<div class="detail-sections"><section><h3>What does this career involve?</h3><p>'+esc(c.description)+'</p></section><section><h3>What kinds of problems might people solve?</h3><p>'+esc(c.typicalActivities)+'</p></section><section><h3>Useful skills</h3><div class="detail-chips">'+c.usefulSkills.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div></section><section><h3>Subjects worth exploring</h3><div class="detail-chips">'+c.academicInterests.map(x=>'<span>'+esc(label("subjects",x))+'</span>').join("")+'</div></section><section><h3>Possible educational pathways</h3><p>'+esc(c.educationPathway)+'</p></section><section><h3>Typical work environments</h3><div class="detail-chips">'+c.workEnvironments.map(x=>'<span>'+esc(label("environments",x))+'</span>').join("")+'</div></section><section><h3>You might enjoy this if…</h3><p>You like '+esc(c.abilities.slice(0,3).map(x=>label("abilities",x).toLowerCase()).join(", "))+' and are curious about '+esc(c.academicInterests.slice(0,2).map(x=>label("subjects",x).toLowerCase()).join(" or "))+'.</p></section><section><h3>Things to consider</h3><p>Day-to-day tasks, training routes, and work settings vary between roles and locations. Talk with someone in the field and try a small related activity to see what fits you.</p></section><section><h3>Related careers</h3><div class="related-list">'+related.map(x=>'<button data-action="career" data-id="'+esc(x.id)+'">'+esc(x.name)+' ↗</button>').join("")+'</div></section></div><div class="detail-footer"><button class="button button-soft" data-action="toggle-compare" data-id="'+esc(c.id)+'">'+(state.compare.has(c.id)?"✓ Added to comparison":"＋ Add to comparison")+'</button><button class="button button-dark" data-action="close-career">Done</button></div>';
 if(!careerDialog.open)careerDialog.showModal();
}
function compareView(){
 const chosen=[...state.compare].map(id=>state.careers.find(c=>c.id===id)).filter(Boolean);
 if(chosen.length<2){toast("Choose two or three careers to compare.");return}
 const categories=[
  ["Main interests",c=>Object.entries(c.riasec).filter(x=>x[1]>=3).map(x=>({R:"Realistic",I:"Investigative",A:"Artistic",S:"Social",E:"Enterprising",C:"Conventional"}[x[0]])).join(", ")],
  ["Useful strengths",c=>c.abilities.map(x=>label("abilities",x)).join(", ")],
  ["Subjects",c=>c.academicInterests.map(x=>label("subjects",x)).join(", ")],
  ["Work environment",c=>c.workEnvironments.map(x=>label("environments",x)).join(", ")],
  ["Typical activities",c=>c.typicalActivities],
  ["Educational pathway",c=>c.educationPathway],
  ["Related careers",c=>(c.relatedCareerIds||[]).map(id=>state.careers.find(x=>x.id===id)?.name).filter(Boolean).slice(0,2).join(", ")],
  ["Exploration score",c=>{const m=state.results.ranked.find(x=>x.id===c.id);return m?m.score+"% compatibility / exploration": "Complete the assessment to compare"}]
 ];
 const rows=categories.map(([title,get])=>'<tr><th>'+esc(title)+'</th>'+chosen.map(c=>'<td>'+esc(get(c))+'</td>').join("")+'</tr>').join("");
 const winner=state.results?.ranked.filter(c=>chosen.some(x=>x.id===c.id)).sort((a,b)=>b.score-a.score)[0];
 document.querySelector("#compare-dialog-content").innerHTML='<span class="eyebrow">SIDE BY SIDE</span><h2>Compare careers</h2><p>Different work can use overlapping strengths. Explore the details that matter to you.</p><div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>WHAT TO COMPARE</th>'+chosen.map(c=>'<th>'+esc(c.name)+'<button data-action="toggle-compare" data-id="'+esc(c.id)+'" aria-label="Remove '+esc(c.name)+'">×</button></th>').join("")+'</tr></thead><tbody>'+rows+'</tbody></table></div><div class="closer-match"><span>WHICH ONE MATCHES YOUR PROFILE MORE CLOSELY?</span><b>'+(winner?esc(winner.name):"Take the assessment to see profile alignment")+'</b><p>'+(winner?"Based on your answers and the weighted match; use the difference as a prompt for exploration.":"")+'</p></div><div class="detail-footer"><button class="button button-soft" data-action="close-compare">Done</button></div>';
 compareDialog.showModal();
}
function printCard(){
 const markup=renderPrintCard({profile:state.profile,dna:state.dna,results:state.results,code:state.code,description:dnaDescription(state.dna),labels:state.labels});
 const holder=document.querySelector("#print-card");holder.innerHTML=markup;holder.setAttribute("aria-hidden","false");window.print();setTimeout(()=>holder.setAttribute("aria-hidden","true"),1000);
}
function scrollToBrowse(){document.querySelector("#recommendations")?.scrollIntoView({behavior:"smooth"})}
function sendAdvisor(text){
 const prompt=text.trim();if(!prompt)return;
 const careers=attachCareerSummaries(state.careers);
 state.messages.push({role:"user",text:prompt});
 const reply=advisorReply(prompt,{careers,results:state.results,profile:state.profile,labels:state.labels,compareCareers:[...state.compare].map(id=>careers.find(c=>c.id===id)).filter(Boolean)});
 state.messages.push({role:"assistant",text:reply.text,source:reply.source});
 render();
 document.querySelector("#advisor")?.scrollIntoView({behavior:"smooth",block:"center"});
}
function toggleCompare(id){if(state.compare.has(id))state.compare.delete(id);else if(state.compare.size<3)state.compare.add(id);else toast("Compare up to three careers at a time.");render()}
document.addEventListener("click",event=>{
 const answer=event.target.closest("[data-answer]");
 if(answer&&state.view==="assessment"){state.answers[state.step]=Number(answer.dataset.answer);render();return}
 const prompt=event.target.closest("[data-prompt]");if(prompt){sendAdvisor(prompt.dataset.prompt);return}
 const button=event.target.closest("[data-action]");if(!button)return;
 const action=button.dataset.action;
 if(action==="home")goHome();
 else if(action==="start")startAssessment();
 else if(action==="back"){if(state.step>0)state.step--;render()}
 else if(action==="next"){if(state.answers[state.step]===null)return;if(state.step<questions.length-1){state.step++;render()}else finish()}
 else if(action==="saved-code")openCodeDialog();
 else if(action==="career")careerDetails(button.dataset.id);
 else if(action==="toggle-compare")toggleCompare(button.dataset.id);
 else if(action==="compare-open")compareView();
 else if(action==="close-career")careerDialog.close();
 else if(action==="close-compare")compareDialog.close();
 else if(action==="print")printCard();
 else if(action==="copy-code")navigator.clipboard?.writeText(state.code).then(()=>toast("Career DNA code copied.")).catch(()=>toast("Your code is "+state.code));
 else if(action==="browse")scrollToBrowse();
});
document.addEventListener("submit",event=>{
 if(event.target.id==="retrieve-form"){event.preventDefault();retrieveCode(new FormData(event.target).get("code"))}
 if(event.target.id==="advisor-form"){event.preventDefault();sendAdvisor(new FormData(event.target).get("prompt"))}
});
document.addEventListener("input",event=>{if(event.target.matches("[data-search]")){state.search=event.target.value;const y=window.scrollY;render();const input=document.querySelector("[data-search]");input?.focus();input?.setSelectionRange(state.search.length,state.search.length);window.scrollTo(0,y)}});
async function init(){
 try{
  const response=await fetch("./data/careers.json");if(!response.ok)throw new Error("Could not load career data.");
  const db=await response.json();state.careers=db.careers;state.labels=db.labels;
  const code=new URLSearchParams(location.search).get("code");
  if(code){const saved=loadCode(code);if(saved){state.answers=saved.answers;state.profile=buildProfile(state.answers,questions);state.dna=makeDna(state.profile);state.results=buildResults(state.profile,state.careers,state.labels);state.code=saved.code;state.view="results"}}
  render();
 }catch(error){root.innerHTML='<section class="load-error"><span>✳</span><h1>One small setup step</h1><p>Career Explorer needs to be opened from a local web server so its career library can load.</p><p>Start a local preview, then open this app again.</p></section>';console.error(error)}
}
init();





