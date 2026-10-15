import test from 'node:test';
import assert from 'node:assert/strict';
import {chartSeries} from './public/chart-data.js';
test('chart totals use each day’s own goal, including exact matches and overrides',()=>{const data=chartSeries({},[{day:'2026-10-13',calories:1000},{day:'2026-10-13',calories:1500},{day:'2026-10-14',calories:2700}],{'2026-10-13':2600},'2026-10-14');assert.equal(data[5].calories,2500);assert.equal(data[5].goalHit,false);assert.equal(data[6].goalHit,true);assert.equal(data[0].calories,null);});
test('sample chart includes both goal outcomes without altering real records',()=>{const weights={'2026-10-14':200};const sample=chartSeries(weights,[],{},'2026-10-14',true);assert.equal(sample.length,7);assert.ok(sample.some(p=>p.goalHit));assert.ok(sample.some(p=>!p.goalHit));assert.equal(weights['2026-10-14'],200);});
