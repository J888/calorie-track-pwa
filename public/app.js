import { STORAGE_KEY, GOALS_KEY, goalFor, validGoal, validateGoals, dayKey, validCalories, totalFor, suggestionsFor, validateEntries, dailyProgress, numericDraft } from './model.js';
const $ = id => document.getElementById(id);
import {WEIGHTS_KEY,validWeight,validateWeights,averageWeight} from './weights.js';
import {renderWeightChart} from './weight-chart.js';
import {SETTINGS_KEY,validSettings} from './settings.js';
import {renderBmiChart} from './bmi-chart.js';
const sampleWeights=false;
let settings=null,settingsUnreadable=false;
let weights={},weightsUnreadable=false,weightDay;
let entries = [], selectedDay = dayKey(), active = -1, matches = [], removed = null, undoTimer, storageUnreadable = false;
const number = new Intl.NumberFormat(undefined, {maximumFractionDigits:2});
let goals = {}, goalsUnreadable = false;
function notice(message='') { $('notice').textContent=message; $('notice').hidden=!message; }
try{const raw=localStorage.getItem(SETTINGS_KEY);if(raw){const value=JSON.parse(raw);if(!validSettings(value))throw Error();settings=value;}}catch{settingsUnreadable=true;notice('Saved settings could not be read. Saving settings is paused to protect them.');}
$('open-settings').addEventListener('click',()=>{$('height-feet').value=settings?.feet??'';$('height-inches').value=settings?.inches??'';$('age').value=settings?.age??'';$('settings-error').textContent='';$('settings').showModal();});
$('close-settings').addEventListener('click',()=>$('settings').close());
$('settings-form').addEventListener('submit',event=>{event.preventDefault();const next={feet:Number($('height-feet').value),inches:Number($('height-inches').value),age:Number($('age').value)};if(!validSettings(next)){$('settings-error').textContent='Enter a valid height (inches from 0 to below 12) and age (1–130).';return;}if(settingsUnreadable){$('settings-error').textContent='Saving is paused because existing settings could not be read.';return;}try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(next));settings=next;renderBmiChart(weights,selectedDay,settings);$('settings').close();}catch{$('settings-error').textContent='Could not save settings. Check browser storage and try again.';}});
try{const raw=localStorage.getItem(WEIGHTS_KEY);if(raw){const data=JSON.parse(raw);if(!validateWeights(data))throw Error();weights=data;}}catch{weightsUnreadable=true;notice('Saved weigh-ins could not be read. Weight saving is paused to protect them.');}
function showWeightAverage(){const result=averageWeight(weights,selectedDay);$('weight-average').textContent=result.average===null?'— lbs':`${result.average.toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1})} lbs`;$('weight-average').title=`${result.count} weigh-in${result.count===1?'':'s'} in the seven days ending ${selectedDay}`;renderWeightChart(weights,selectedDay,sampleWeights,entries,goals);renderBmiChart(weights,selectedDay,settings);}
function saveWeights(next){if(weightsUnreadable){$('weight-error').textContent='Saved weigh-ins could not be read. Saving is paused.';return false;}try{localStorage.setItem(WEIGHTS_KEY,JSON.stringify(next));weights=next;showWeightAverage();$('save-status').textContent='All entries saved';return true;}catch{$('weight-error').textContent='Could not save. Check browser storage and try again.';return false;}}
$('open-weigh-in').addEventListener('click',()=>{weightDay=selectedDay;$('weigh-in-date').textContent=new Date(`${weightDay}T12:00:00`).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});$('weight-input').value=weights[weightDay]??'';$('weight-error').textContent='';$('remove-weight').hidden=!Object.hasOwn(weights,weightDay);$('weigh-in').showModal();$('weight-input').focus();$('weight-input').select();});
$('close-weigh-in').addEventListener('click',()=>$('weigh-in').close());
$('weigh-in-form').addEventListener('submit',event=>{event.preventDefault();if(!validWeight($('weight-input').value)){$('weight-error').textContent='Enter a weight above 0 and up to 2,000 lbs, with up to two decimal places.';return;}if(saveWeights({...weights,[weightDay]:Number($('weight-input').value)}))$('weigh-in').close();});
$('remove-weight').addEventListener('click',()=>{const next={...weights};delete next[weightDay];if(saveWeights(next))$('weigh-in').close();});
try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){ const data=JSON.parse(raw); if(!validateEntries(data)) throw Error(); entries=data; } } catch { storageUnreadable=true; notice('Saved data could not be read. Saving is paused to protect existing entries.'); }
try { const raw=localStorage.getItem(GOALS_KEY); if(raw){ const data=JSON.parse(raw); if(!validateGoals(data)) throw Error(); goals=data; } } catch { goalsUnreadable=true; notice('Saved goals could not be read. Goal saving is paused to protect them.'); }
function sizeGoal() { $('goal').style.width=`${Math.max(4.5,$('goal').value.length+.5)}ch`; }
function showGoal() { $('goal').value=goalFor(goals,selectedDay); $('goal').removeAttribute('aria-invalid');sizeGoal(); }
function updateSummary() {
  const total=totalFor(entries,selectedDay),goal=goalFor(goals,selectedDay),progress=dailyProgress(total,goal);
  $('total').textContent=number.format(total);
  $('remaining').textContent=total>goal?`${number.format(Math.round((total-goal)*100)/100)} over! 💪🏻`:`${number.format(progress.remaining)} to go! 👀`;
  $('progress-fill').setAttribute('stroke-dasharray',`${progress.percent} 100`);
  $('progress-fill').style.opacity=progress.percent===0?'0':'1';
  $('progress').dataset.level=progress.percent<20?'red':progress.percent<40?'yellow':progress.percent<70?'orange':'green';
  $('total').style.color=getComputedStyle($('progress')).getPropertyValue('--progress-color');
  $('progress-check').toggleAttribute('hidden',progress.percent<100);
  $('progress').setAttribute('aria-valuemax',String(goal));$('progress').setAttribute('aria-valuenow',String(Math.min(total,goal)));
  $('progress').setAttribute('aria-valuetext',`${number.format(total)} of ${number.format(goal)} kcal`);
  renderWeightChart(weights,selectedDay,sampleWeights,entries,goals);
}
function numbersOnly(input) {
  let previous=input.value;
  input.addEventListener('beforeinput',e=>{if(e.data!==null&&!e.isComposing){const next=input.value.slice(0,input.selectionStart)+e.data+input.value.slice(input.selectionEnd);if(!numericDraft(next))e.preventDefault();}});
  input.addEventListener('input',()=>{if(numericDraft(input.value))previous=input.value;else input.value=numericDraft(previous)?previous:'';});
  input.addEventListener('focus',()=>{previous=input.value;});
}
numbersOnly($('calories'));numbersOnly($('goal'));
numbersOnly($('weight-input'));
function saveGoal() {
  if(!validGoal($('goal').value)){$('goal').setAttribute('aria-invalid','true');notice('Enter a goal greater than 0, up to 100,000 kcal, with at most two decimal places.');return false;}
  if(goalsUnreadable){notice('Goal saving is paused because existing goal data could not be read.');return false;}
  try { const next={...goals,[selectedDay]:Number($('goal').value)};localStorage.setItem(GOALS_KEY,JSON.stringify(next));goals=next;showGoal();updateSummary();$('save-status').textContent='All entries saved';notice();return true; }
  catch { notice('Could not save your goal. Check browser storage and try again.');return false; }
}
$('goal').addEventListener('input',()=>{sizeGoal();$('goal').removeAttribute('aria-invalid');});
$('goal').addEventListener('focus',()=> $('goal').select());
$('goal').addEventListener('blur',saveGoal);
$('goal').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(saveGoal())$('goal').blur();}if(e.key==='Escape'){showGoal();notice();$('goal').blur();}});
function persist(next) {
  if(storageUnreadable){notice('Saving is paused because existing data could not be read.');return false;}
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); entries=next; updateSummary();$('save-status').textContent='All entries saved'; notice(); return true; }
  catch { notice('Could not save on this device. Your entry is still here. Check browser storage and try again.'); return false; }
}
function closeSuggestions() { $('suggestions').hidden=true; $('food').setAttribute('aria-expanded','false'); $('food').removeAttribute('aria-activedescendant'); active=-1; }
function choose(index) { const match=matches[index]; if(!match)return; $('food').value=match.name; $('calories').value=match.calories; closeSuggestions(); $('calories').focus(); $('calories').select(); }
function suggest() {
  matches=suggestionsFor(entries,$('food').value); active=-1; $('suggestions').replaceChildren();
  matches.forEach((entry,i)=>{const button=document.createElement('button'); button.type='button'; button.id=`suggestion-${i}`; button.setAttribute('role','option'); button.setAttribute('aria-selected','false'); const name=document.createElement('span');name.textContent=entry.name; const value=document.createElement('span');value.className='suggestion-value';value.textContent=`${number.format(entry.calories)} kcal`;button.append(name,value);button.addEventListener('pointerdown',e=>e.preventDefault());button.addEventListener('click',()=>choose(i));$('suggestions').append(button);});
  $('suggestions').hidden=!matches.length; $('food').setAttribute('aria-expanded',String(!!matches.length));
}
function commitDraft(refocus=false) {
  const name=$('food').value.trim(), calories=$('calories').value.trim();
  if(!name && !calories)return true;
  if(!name || !validCalories(calories)){ if(refocus){notice(!name?'Enter a food name.':'Enter a calorie value of 0 or more (up to two decimal places).');(!name?$('food'):$('calories')).focus();}return false; }
  if(!persist([...entries,{id:crypto.randomUUID(),name,calories:Number(calories),day:selectedDay,createdAt:Date.now()}]))return false;
  $('food').value='';$('calories').value='';closeSuggestions();render();if(refocus)$('food').focus();return true;
}
function render() {
  const today=dayKey(); const date=new Date(`${selectedDay}T12:00:00`);
  $('date').value=selectedDay;$('today').hidden=selectedDay===today;
  $('day-title').textContent=selectedDay===today?'Today':date.toLocaleDateString(undefined,{weekday:'long'});
  $('day-subtitle').textContent=date.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});
  updateSummary();
  showGoal();
  showWeightAverage();
  const daily=entries.filter(e=>e.day===selectedDay).sort((a,b)=>b.createdAt-a.createdAt);
  $('empty').hidden=!!daily.length;$('count').textContent=`${daily.length} ${daily.length===1?'entry':'entries'}`;$('entries').replaceChildren();
  daily.forEach(entry=>{
    const row=document.createElement('div');row.className='entry-row saved';
    const food=document.createElement('input');food.type='search';food.autocomplete='off';food.value=entry.name;food.maxLength=160;food.setAttribute('aria-label','Edit food entry');
    const calories=document.createElement('input');calories.value=entry.calories;calories.inputMode='decimal';calories.setAttribute('aria-label',`Edit calories for ${entry.name}`);numbersOnly(calories);
    function saveEdit(){const name=food.value.trim();if(!name||!validCalories(calories.value)){notice('Keep a food name and a valid calorie value. Your previous entry is still saved.');return false;}if(persist(entries.map(e=>e.id===entry.id?{...e,name,calories:Number(calories.value)}:e))){$('total').textContent=number.format(totalFor(entries,selectedDay));return true;}return false;}
    row.addEventListener('focusout',e=>{if(!row.contains(e.relatedTarget))saveEdit();});
    row.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();if(saveEdit()){render();$('food').focus();}}});
    const duplicate=document.createElement('button');duplicate.type='button';duplicate.className='duplicate';duplicate.textContent='⧉';duplicate.title='Duplicate entry';duplicate.setAttribute('aria-label',`Duplicate ${entry.name}`);
    duplicate.addEventListener('click',()=>{if(!saveEdit())return;const source=entries.find(e=>e.id===entry.id);if(source&&persist([...entries,{...source,id:crypto.randomUUID(),createdAt:Math.max(Date.now(),...entries.map(e=>e.createdAt))+1}]))render();});
    const remove=document.createElement('button');remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label',`Remove ${entry.name}`);
    remove.addEventListener('click',()=>{if(persist(entries.filter(e=>e.id!==entry.id))){removed=entry;render();$('undo').hidden=false;clearTimeout(undoTimer);undoTimer=setTimeout(()=>{$('undo').hidden=true;removed=null;},8000);}});
    const actions=document.createElement('div');actions.className='row-actions';actions.append(duplicate,remove);
    row.append(food,calories,actions);$('entries').append(row);
  });
}
$('entry-form').addEventListener('submit',e=>{e.preventDefault();commitDraft(true);});
$('entry-form').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.defaultPrevented&&!e.isComposing){e.preventDefault();commitDraft(true);}});
$('draft').addEventListener('focusout',e=>{if(!$('draft').contains(e.relatedTarget)){closeSuggestions();commitDraft();}});
$('food').addEventListener('input',suggest);$('food').addEventListener('focus',suggest);
$('food').addEventListener('keydown',e=>{
  if(e.key==='Escape')closeSuggestions();
  if(!matches.length||$('suggestions').hidden)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;[...$('suggestions').children].forEach((b,i)=>b.setAttribute('aria-selected',String(i===active)));$('food').setAttribute('aria-activedescendant',`suggestion-${active}`);}
  if(e.key==='Enter'&&active>=0){e.preventDefault();choose(active);}
});
function changeDay(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return;if(!commitDraft(true)){$('date').value=selectedDay;return;}selectedDay=day;render();}
$('date').addEventListener('change',()=>changeDay($('date').value));
for(const [id,offset] of [['previous',-1],['next',1]])$(id).addEventListener('click',()=>{const d=new Date(`${selectedDay}T12:00:00`);d.setDate(d.getDate()+offset);changeDay(dayKey(d));});
$('today').addEventListener('click',()=>changeDay(dayKey()));
$('undo-button').addEventListener('click',()=>{if(removed&&persist([...entries,removed])){removed=null;clearTimeout(undoTimer);$('undo').hidden=true;render();}});
$('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),entries,goals,weights,settings,defaultGoal:2700},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`daily-calories-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){try{const data=JSON.parse(e.newValue??'[]');if(validateEntries(data)){entries=data;render();}}catch{notice('Another tab changed your saved data. Reload to check it.');}}});
window.addEventListener('storage',e=>{if(e.key===GOALS_KEY){try{const data=JSON.parse(e.newValue??'{}');if(validateGoals(data)){goals=data;showGoal();updateSummary();}else throw Error();}catch{notice('Another tab changed your saved goals. Reload to check them.');}}});
let lastToday=dayKey();setInterval(()=>{const today=dayKey();if(today!==lastToday){if(selectedDay===lastToday&&commitDraft())selectedDay=today;lastToday=today;render();}},30000);
window.addEventListener('storage',event=>{if(event.key===WEIGHTS_KEY){try{const data=JSON.parse(event.newValue??'{}');if(!validateWeights(data))throw Error();weights=data;showWeightAverage();}catch{notice('Another tab changed saved weigh-ins. Reload to check them.');}}});
render();
window.addEventListener('storage',event=>{if(event.key===SETTINGS_KEY){try{const value=JSON.parse(event.newValue??'null');if(value!==null&&!validSettings(value))throw Error();settings=value;renderBmiChart(weights,selectedDay,settings);}catch{notice('Another tab changed saved settings. Reload to check them.');}}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>notice('Offline mode is unavailable. You can still use the tracker while connected.'));
