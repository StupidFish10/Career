const norm=s=>(s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").trim();
const findMentioned=(text,careers)=>careers.filter(c=>norm(text).includes(norm(c.name))||norm(text).includes(c.id.replaceAll("-"," ")));
export function advisorReply(message,context){
  const q=norm(message),{careers,results,profile,labels}=context;
  const mentioned=findMentioned(message,careers);
  if((q.includes("why")||q.includes("recommend"))&&mentioned.length){
    const career=results.ranked.find(c=>c.id===mentioned[0].id)||mentioned[0];
    const why=career.why||[];
    return{source:"Your results",text:career.score?career.name+" appears among your exploration matches ("+career.score+"% compatibility / exploration score). "+(why.length?"Your answers overlap through "+why.slice(0,3).join(", ").toLowerCase()+".":"The score reflects several parts of your profile.")+" It is a conversation starter, not a prediction.":career.name+" connects with some of the interests you chose. Open its career page to see useful subjects, skills, and pathways."};
  }
  if((q.includes("similar")||q.includes("related")||q.includes("other careers"))&&mentioned.length){
    const career=mentioned[0],names=(career.relatedCareerIds||[]).map(id=>careers.find(c=>c.id===id)?.name).filter(Boolean).slice(0,3);
    return{source:"Career guide",text:"Careers with some nearby skills or interests to "+career.name+" include "+(names.join(", ")||"other roles in "+career.category)+". The day-to-day work can still be quite different, so open each profile and compare what sounds engaging."};
  }
  if(q.includes("compare")||q.includes(" vs ")||q.includes("difference")){
    const choices=mentioned.length>=2?mentioned.slice(0,2):context.compareCareers||[];
    if(choices.length>=2)return{source:"Your results + career guide",text:""+choices[0].name+" leans toward "+choices[0].riasecSummary+" interests and "+choices[0].category.toLowerCase()+" work. "+choices[1].name+" leans toward "+choices[1].riasecSummary+" interests and "+choices[1].category.toLowerCase()+" work. Your profile gives "+(results.ranked.find(c=>c.id===choices[0].id)?.score||0)+"% for "+choices[0].name+" and "+(results.ranked.find(c=>c.id===choices[1].id)?.score||0)+"% for "+choices[1].name+". Those scores help choose what to explore first; they don't measure future success."};
  }
  if((q.includes("math")||q.includes("mathemat"))&&(q.includes("coding")||q.includes("code")||q.includes("programming"))){
    const picks=careers.filter(c=>c.academicInterests.includes("mathematics")&&!c.academicInterests.includes("computer-science")).map(c=>({...c,s:c.abilities.includes("math")?2:1})).sort((a,b)=>b.s-a.s).slice(0,3);
    return{source:"Career guide + suggestion",text:"If mathematics interests you and coding does not, you could explore "+picks.map(c=>c.name).join(", ")+". Some roles still use software tools, but coding is not the central activity in every math-focused path. Try a small statistics, finance, or optimization puzzle and notice which parts you enjoy."};
  }
  if(q.includes("try")||q.includes("before deciding")||q.includes("explore")){
    const career=mentioned[0]||results.top[0];
    const ideas=career?["watch a day-in-the-life interview and note which tasks sound interesting","try a small project related to "+career.name.toLowerCase(),"ask someone in a related field what surprised them about the work"]:["make a tiny project around one of your strongest interests","talk with someone whose work you are curious about","compare a school subject with a real-world problem"];
    return{source:"Exploratory suggestion",text:"A few low-pressure ways to explore: "+ideas.join("; ")+". Treat what you learn as new information, not a commitment."};
  }
  if(q.includes("help")||q.includes("people")||q.includes("creative")||q.includes("technology")){
    const pool=results.ranked.filter(c=>(q.includes("people")?c.workValues.includes("helping"):true)&&(q.includes("creative")?c.abilities.includes("creativity")||c.riasec.A>=3:true)&&(q.includes("technology")?c.abilities.includes("technology"):true)).slice(0,3);
    if(pool.length)return{source:"Your results + suggestion",text:"Based on the interests you mentioned, these may be useful to browse: "+pool.map(c=>c.name).join(", ")+". Open a profile and compare the problems, subjects, and work settings each one involves."};
  }
  const strongest=Object.entries(profile.riasec).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>({R:"hands-on",I:"investigative",A:"creative",S:"people-centered",E:"organizing and leading",C:"structured"}[x[0]]));
  return{source:"Your results + career guide",text:"Your answers lean toward "+strongest.join(" and ")+" interests. A useful next step is to choose one of your top matches, read its activities, then compare it with a role from a different field. You can also ask me about a career by name or describe a subject you enjoy."};
}
export function attachCareerSummaries(careers){
  const names={R:"hands-on",I:"investigative",A:"creative",S:"people-centered",E:"enterprising",C:"structured"};
  return careers.map(c=>({...c,riasecSummary:Object.entries(c.riasec).filter(x=>x[1]>=3).map(x=>names[x[0]]).join(" and ")}));
}
