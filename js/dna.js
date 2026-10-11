const highest=obj=>Object.entries(obj||{}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0];
const relative=(obj,keys)=>{const values=keys.map(k=>obj[k]||0),max=Math.max(1,...values);return values.reduce((a,b)=>a+b,0)/keys.length/max*100};
export function makeDna(profile){
  const dims=[
    ["Curiosity",relative(profile.riasec,["I"])*.65+relative(profile.abilities,["research","curiosity","logic"])*.35],
    ["Problem solving",relative(profile.riasec,["I","R"])*.35+relative(profile.abilities,["problemSolving","logic","math"])*.65],
    ["Creativity",relative(profile.riasec,["A"])*.48+relative(profile.abilities,["creativity","design"])*.52],
    ["Technology",relative(profile.riasec,["R","I"])*.3+relative(profile.abilities,["technology"])*.4+relative(profile.academics,["computer-science"])*.3],
    ["Communication",relative(profile.riasec,["S","E"])*.35+relative(profile.abilities,["communication","writing","languages"])*.65],
    ["Leadership",relative(profile.riasec,["E"])*.4+relative(profile.abilities,["leadership"])*.25+relative(profile.values,["leadership"])*.35],
    ["Independence",relative(profile.values,["independence"])*.7+relative(profile.riasec,["I","A"])*.3],
    ["Social impact",relative(profile.riasec,["S"])*.45+relative(profile.values,["helping"])*.55]
  ].map(([name,value])=>({name,value:Math.round(Math.max(0,Math.min(100,value)))}));
  const riasec=Object.entries(profile.riasec).map(([key,value])=>({key,value:Math.round(value)})).sort((a,b)=>b.value-a.value||a.key.localeCompare(b.key));
  const top=riasec[0]?.key||"I",second=riasec[1]?.key||"R";
  const ability=highest(profile.abilities);
  let type="Explorer";
  if(top==="A"||ability==="creativity"||ability==="design")type="Creator";
  else if(top==="S"||ability==="empathy")type="Communicator";
  else if(top==="E"||ability==="leadership")type="Leader";
  else if(top==="C"||ability==="organization")type="Organizer";
  else if(top==="R"||(top==="I"&&second==="R"&&!profile.abilities.technology&&ability==="handsOn"))type="Builder";
  else if(top==="I"&&(ability==="math"||ability==="logic"))type="Analyst";
  else if(top==="I"&&(ability==="technology"||profile.abilities.technology||profile.academics["computer-science"]))type="Inventor";else if(top==="R"||second==="R"||ability==="handsOn")type="Builder";
  return{type,dimensions:dims,riasec,topTraits:[...dims].sort((a,b)=>b.value-a.value).slice(0,6).map(x=>x.name)};
}
export function dnaDescription(dna){
  const lead=dna.topTraits.slice(0,3).join(", ").toLowerCase();
  return "Your answers point toward a mix of "+lead+". Use this as a way to start conversations and try small experiences, not as a label you need to fit.";
}
export function makeCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);
  const raw=[...bytes].map(b=>chars[b%chars.length]).join("");
  return raw.slice(0,4)+"-"+raw.slice(4);
}

