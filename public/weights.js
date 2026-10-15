import {dayKey} from './model.js';
export const WEIGHTS_KEY='daily-weigh-ins-v1';
export function validWeight(value){return /^\d+(\.\d{1,2})?$/.test(String(value).trim())&&Number(value)>0&&Number(value)<=2000;}
export function validateWeights(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([day,weight])=>/^\d{4}-\d{2}-\d{2}$/.test(day)&&typeof weight==='number'&&validWeight(weight));}
export function averageWeight(weights,endDay){
  const start=new Date(`${endDay}T12:00:00`);start.setDate(start.getDate()-6);const first=dayKey(start);
  const values=Object.entries(weights).filter(([day])=>day>=first&&day<=endDay).map(([,weight])=>weight);
  return {count:values.length,average:values.length?Math.round(values.reduce((sum,w)=>sum+w,0)/values.length*10)/10:null};
}
