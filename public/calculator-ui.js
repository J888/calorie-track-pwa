import {calculate} from './calculator.js';
import {validCalories} from './model.js';
const dialog=document.getElementById('calculator'),expression=document.getElementById('calculation'),result=document.getElementById('calculation-result'),use=document.getElementById('use-calories');
let text='',value=null;
function refresh(showError=false){expression.value=text||'0';try{value=text?calculate(text):null;result.textContent=value===null?'Enter a calculation':`${value.toLocaleString(undefined,{maximumFractionDigits:2})} kcal`;use.disabled=value===null||!validCalories(value);}catch(error){value=null;result.textContent=showError?error.message:'…';use.disabled=true;}expression.scrollLeft=expression.scrollWidth;}
function key(key){
  if(key==='clear')text='';
  else if(key==='backspace')text=text.slice(0,-1);
  else if(key==='equals'){try{text=String(calculate(text));}catch{refresh(true);return;}}
  else if(text.length<200)text+=key;
  refresh();
}
document.getElementById('open-calculator').addEventListener('click',()=>{refresh();dialog.showModal();});
document.getElementById('close-calculator').addEventListener('click',()=>dialog.close());
dialog.querySelectorAll('[data-key]').forEach(button=>button.addEventListener('click',()=>key(button.dataset.key)));
dialog.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  if(/^[\d.+*/()\-]$/.test(event.key)){event.preventDefault();key(event.key);}
  else if(event.key==='Backspace'){event.preventDefault();key('backspace');}
  else if(event.key==='Enter'&&event.target!==use&&event.target.id!=='close-calculator'){event.preventDefault();key('equals');}
});
use.addEventListener('click',()=>{if(value===null||!validCalories(value))return;const calories=document.getElementById('calories');calories.value=String(value);dialog.close();calories.focus();calories.select();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});
