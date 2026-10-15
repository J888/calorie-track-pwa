import {weightSeries} from './weights.js';
import {bmiFor,validSettings} from './settings.js';
const ns='http://www.w3.org/2000/svg';
function node(tag,attrs={},text){const el=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;return el;}
export function renderBmiChart(weights,day,settings){
  const svg=document.getElementById('bmi-chart'),empty=document.getElementById('bmi-empty'),adult=validSettings(settings)&&settings.age>=20;
  const series=weightSeries(weights,day).map(p=>({...p,bmi:p.weight===null?null:bmiFor(p.weight,settings)}));
  const values=series.filter(p=>p.bmi!==null).map(p=>p.bmi),dateLabel=d=>new Date(`${d}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'});
  document.getElementById('bmi-range').textContent=`${dateLabel(series[0].day)} – ${dateLabel(day)}`;
  document.getElementById('bmi-guides').hidden=!adult;
  document.getElementById('bmi-note').textContent=validSettings(settings)&&!adult?'Adult reference lines do not apply under age 20. Categories for children and teens require age- and sex-specific percentiles.':'BMI = lbs × 703 ÷ height in inches². Adult normal range: 18.5 to below 25.';
  svg.replaceChildren();svg.toggleAttribute('hidden',!values.length);empty.hidden=!!values.length;
  empty.textContent=!validSettings(settings)?'Set your height and age in Settings to calculate BMI.':'Add a weigh-in to start your seven-day BMI chart.';
  if(!values.length)return;
  svg.append(node('title',{},'Seven-day BMI trend'),node('desc',{},series.map(p=>`${dateLabel(p.day)}: ${p.bmi===null?'no weigh-in':p.bmi+' BMI'}`).join('; ')));
  const refs=adult?[18.5,25]:[],lo=Math.max(0,Math.floor(Math.min(...values,...refs)-2)),hi=Math.ceil(Math.max(...values,...refs)+2),x=i=>40+i*48,y=v=>175-(v-lo)/(hi-lo)*140;
  for(let i=0;i<3;i++){const value=lo+(hi-lo)*i/2;svg.append(node('line',{x1:40,x2:328,y1:y(value),y2:y(value),class:'chart-grid'}),node('text',{x:32,y:y(value)+3,'text-anchor':'end',class:'chart-axis'},value.toFixed(1)));}
  if(adult)for(const [value,kind]of [[18.5,'underweight'],[25,'normal']]){svg.append(node('line',{x1:40,x2:328,y1:y(value),y2:y(value),class:`bmi-guide ${kind}`}),node('text',{x:328,y:y(value)-5,'text-anchor':'end',class:`bmi-guide-label ${kind}`},String(value)));}
  let path='',connected=false;
  series.forEach((p,i)=>{const date=new Date(`${p.day}T12:00:00`);svg.append(node('text',{x:x(i),y:204,'text-anchor':'middle',class:'chart-axis'},`${date.getMonth()+1}/${date.getDate()}`));if(p.bmi===null){connected=false;return;}path+=`${connected?'L':'M'}${x(i)},${y(p.bmi)} `;connected=true;});
  svg.append(node('path',{d:path,class:'chart-line'}));
  series.forEach((p,i)=>{if(p.bmi===null)return;const dot=node('circle',{cx:x(i),cy:y(p.bmi),r:3.5,class:'chart-dot'});dot.append(node('title',{},`${dateLabel(p.day)}: BMI ${p.bmi}`));svg.append(dot,node('text',{x:x(i),y:y(p.bmi)-12,'text-anchor':'middle',class:'chart-value'},String(p.bmi)));});
}
