const WEIGHTS={riasec:0.40,abilities:0.25,academics:0.15,values:0.15,environment:0.05};
const add=(target,source)=>{for(const [key,value] of Object.entries(source||{}))target[key]=(target[key]||0)+value};
const vector=()=>Object.create(null);
const cosine=(a,b)=>{
  const keys=new Set([...Object.keys(a||{}),...Object.keys(b||{})]);
  let dot=0,aa=0,bb=0;
  for(const key of keys){const x=Number(a?.[key]||0),y=Number(b?.[key]||0);dot+=x*y;aa+=x*x;bb+=y*y}
  if(!aa&&!bb)return 0.5;
  if(!aa||!bb)return 0;
  return Math.max(0,Math.min(1,dot/(Math.sqrt(aa)*Math.sqrt(bb))));
};
export function buildProfile(answers,questions){
  const profile={riasec:vector(),abilities:vector(),academics:vector(),values:vector(),environment:vector()};
  questions.forEach((q,index)=>{
    const picked=answers[index];if(picked===undefined||picked===null)return;
    const option=q.options[picked];if(!option)return;
    if(index<6)add(profile.riasec,option.map);
    else if(index<10)add(profile.abilities,option.map);
    else if(index<14){add(profile.values,option.map);add(profile.environment,option.env)}
    else add(profile.academics,option.map);
  });
  return profile;
}
export function matchCareer(profile,career){
  const components={
    interests:Math.round(cosine(profile.riasec,career.riasec)*100),
    strengths:Math.round(cosine(profile.abilities,Object.fromEntries(career.abilities.map(k=>[k,1])))*100),
    academics:Math.round(cosine(profile.academics,Object.fromEntries(career.academicInterests.map(k=>[k,1])))*100),
    values:Math.round(cosine(profile.values,Object.fromEntries(career.workValues.map(k=>[k,1])))*100),
    environment:Math.round(cosine(profile.environment,Object.fromEntries(career.workEnvironments.map(k=>[k,1])))*100)
  };
  const score=Math.round(components.interests*WEIGHTS.riasec+components.strengths*WEIGHTS.abilities+components.academics*WEIGHTS.academics+components.values*WEIGHTS.values+components.environment*WEIGHTS.environment);
  return{...career,score,components};
}
export function explainMatch(profile,career,labels){
  const factors=[];
  const topInterest=Object.entries(profile.riasec).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>0);
  const interest=topInterest.find(([key])=>(career.riasec[key]||0)>=3);
  if(interest)factors.push("A strong "+({R:"hands-on",I:"investigative",A:"creative",S:"people-focused",E:"enterprising",C:"structured"}[interest[0]])+" interest");
  const common=(profileMap,careerKeys,labelMap)=>Object.keys(profileMap||{}).filter(k=>(profileMap[k]||0)>0&&careerKeys.includes(k)).sort((a,b)=>profileMap[b]-profileMap[a]).map(k=>labelMap[k]||k);
  const ability=common(profile.abilities,career.abilities,labels.abilities)[0];
  if(ability)factors.push("Your "+ability.toLowerCase()+" strength");
  const subject=common(profile.academics,career.academicInterests,labels.subjects)[0];
  if(subject)factors.push("Interest in "+subject);
  const value=common(profile.values,career.workValues,labels.values)[0];
  if(value)factors.push("Preference for "+value.toLowerCase());
  const place=common(profile.environment,career.workEnvironments,labels.environments)[0];
  if(place&&factors.length<4)factors.push("A "+place.toLowerCase()+" setting");
  return factors.slice(0,4);
}
export function buildResults(profile,careers,labels){
  const ranked=careers.map(c=>({...matchCareer(profile,c),why:explainMatch(profile,c,labels)})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  const top=ranked.slice(0,5);
  const main=top[0];
  const eligible=ranked.filter(c=>c.discoveryCandidate&&c.score>=30&&c.id!==main?.id);
  const discovery=[];
  const usedCategories=new Set([main?.category]);
  for(const c of eligible){if(!usedCategories.has(c.category)&&discovery.length<4){discovery.push(c);usedCategories.add(c.category)}}
  for(const c of eligible){if(discovery.length>=3)break;if(!discovery.some(x=>x.id===c.id))discovery.push(c)}
  if(discovery.length<3){for(const c of ranked.filter(x=>x.id!==main?.id)){if(discovery.length>=3)break;if(!discovery.some(x=>x.id===c.id))discovery.push(c)}}
  return{ranked,top,discovery};
}
export function similarityFor(profile,career){return matchCareer(profile,career).score}
export const weights=WEIGHTS;
