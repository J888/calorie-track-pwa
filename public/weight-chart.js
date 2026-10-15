import {chartSeries} from './chart-data.js';
const ns='http://www.w3.org/2000/svg';
function node(tag,attrs={},text){const el=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;return el;}
export function renderWeightChart(weights,endDay,sample=false,entries=[],goals={}){
  const series=chartSeries(weights,entries,goals,endDay,sample);
  const svg=document.getElementById('weight-chart'),values=series.filter(p=>p.weight!==null).map(p=>p.weight);
  const hasData=values.length>0||series.some(p=>p.calories!==null);
  svg.replaceChildren();svg.toggleAttribute('hidden',!hasData);document.getElementById('weight-chart-empty').hidden=hasData;
  const dateLabel=day=>new Date(`${day}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'});
  document.getElementById('weight-chart-range').textContent=`${dateLabel(series[0].day)} – ${dateLabel(endDay)}`;
  if(!hasData)return;
  svg.append(node('title',{},sample?'Sample seven-day weight and calorie trend':'Seven-day weight and calorie trend'),node('desc',{},series.map(p=>`${dateLabel(p.day)}: ${p.weight===null?'no weigh-in':p.weight+' lbs'}, ${p.calories===null?'no food logged':p.calories+' kcal, goal '+p.goal+', '+(p.goalHit?'goal hit':'below goal')}`).join('; ')));
  const padding=values.length?Math.max(.5,(Math.max(...values)-Math.min(...values))*.2):.5,low=values.length?Math.max(0,Math.min(...values)-padding):0,high=values.length?Math.max(...values)+padding:1;
  const calorieMax=Math.max(1000,Math.ceil(Math.max(...series.map(p=>Math.max(p.calories??0,p.goal)))*1.1/1000)*1000);
  const x=i=>43+i*45,y=value=>175-(value-low)/(high-low)*140,cy=value=>175-value/calorieMax*140;
  svg.append(node('text',{x:34,y:16,'text-anchor':'end',class:'chart-axis'},'lbs'),node('text',{x:321,y:16,class:'chart-calorie-axis'},'kcal'));
  for(let i=0;i<3;i++){const value=low+(high-low)*i/2,py=y(value);svg.append(node('line',{x1:43,x2:313,y1:py,y2:py,class:'chart-grid'}),node('text',{x:34,y:py+3,'text-anchor':'end',class:'chart-axis'},values.length?value.toFixed(1):'—'),node('text',{x:321,y:py+3,class:'chart-calorie-axis'},String(calorieMax*i/2)));}
  let path='';let connected=false;
  series.forEach((point,i)=>{if(point.weight===null){connected=false;return;}path+=`${connected?'L':'M'}${x(i)},${y(point.weight)} `;connected=true;});
  svg.append(node('path',{d:path,class:'chart-line'}));
  let caloriePath='',calorieConnected=false;
  series.forEach((point,i)=>{if(point.calories===null){calorieConnected=false;return;}caloriePath+=`${calorieConnected?'L':'M'}${x(i)},${cy(point.calories)} `;calorieConnected=true;});
  svg.append(node('path',{d:caloriePath,class:'chart-calorie-line'}));
  series.forEach((point,i)=>{
    const date=new Date(`${point.day}T12:00:00`);
    svg.append(node('text',{x:x(i),y:204,'text-anchor':'middle',class:'chart-axis'},`${date.getMonth()+1}/${date.getDate()}`));
    if(point.calories!==null){const dot=node('circle',{cx:x(i),cy:cy(point.calories),r:4,class:`chart-calorie-dot ${point.goalHit?'goal-hit':'goal-missed'}`});dot.append(node('title',{},`${dateLabel(point.day)}: ${point.calories} kcal / ${point.goal} goal — ${point.goalHit?'goal hit':'below goal'}`));svg.append(dot);}
    if(point.weight===null)return;
    const dot=node('circle',{cx:x(i),cy:y(point.weight),r:3.5,class:'chart-dot'});dot.append(node('title',{},`${dateLabel(point.day)}: ${point.weight} lbs`));svg.append(dot,node('text',{x:x(i),y:y(point.weight)-12,'text-anchor':'middle',class:'chart-value'},String(point.weight)));
  });
}
