import test from 'node:test';
import assert from 'node:assert/strict';
import {dayKey,validCalories,totalFor,suggestionsFor,validateEntries} from './public/model.js';
const entries=[{id:'a',name:'Oatmeal',calories:150.5,day:'2026-10-10',createdAt:1},{id:'b',name:'oatmeal',calories:200,day:'2026-10-11',createdAt:2},{id:'c',name:'Toast',calories:100.1,day:'2026-10-11',createdAt:3}];
test('totals only include the selected day and avoid floating point artifacts',()=>{assert.equal(totalFor(entries,'2026-10-11'),300.1);assert.equal(totalFor(entries,'2026-10-09'),0);});
test('suggestions reuse the latest value across days and deduplicate names',()=>{assert.deepEqual(suggestionsFor(entries,'oat').map(e=>e.calories),[200]);assert.equal(suggestionsFor(entries,'toast')[0].name,'Toast');});
test('calories allow zero and decimals, reject empty, negative and invalid values',()=>{for(const value of ['0','12.25','200'])assert.equal(validCalories(value),true);for(const value of ['', '-1', 'NaN','Infinity','12abc','2.333'])assert.equal(validCalories(value),false);});
test('storage validation rejects corrupt records',()=>{assert.equal(validateEntries(entries),true);assert.equal(validateEntries([{...entries[0],calories:'100'}]),false);assert.equal(validateEntries({}),false);});
test('day keys use the local calendar date',()=>assert.equal(dayKey(new Date(2026,9,11,23,59)),'2026-10-11'));
