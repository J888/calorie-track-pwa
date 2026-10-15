import {weightSeries} from './weights.js';
import {goalFor,totalFor} from './model.js';
export function chartSeries(weights,entries,goals,endDay,sample=false){
  return weightSeries(weights,endDay).map((point,i)=>{
    const goal=sample?2700:goalFor(goals,point.day);
    const calories=sample?[2750,2480,2820,2700,2550,2910,2780][i]:entries.some(e=>e.day===point.day)?totalFor(entries,point.day):null;
    return {...point,weight:sample?[181.4,181,181.2,180.7,180.6,180.8,180.2][i]:point.weight,calories,goal,goalHit:calories!==null&&calories>=goal};
  });
}
