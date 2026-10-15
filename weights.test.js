import test from 'node:test';
import assert from 'node:assert/strict';
import {averageWeight,validateWeights,validWeight} from './public/weights.js';
test('seven calendar days include the selected day, exclude older and future dates, and skip missing days',()=>{const weights={'2026-10-07':500,'2026-10-08':182,'2026-10-12':180,'2026-10-14':178,'2026-10-15':500};assert.deepEqual(averageWeight(weights,'2026-10-14'),{count:3,average:180});assert.deepEqual(averageWeight({},'2026-10-14'),{count:0,average:null});});
test('window crosses months and years and includes the sixth preceding day',()=>{assert.deepEqual(averageWeight({'2025-12-26':300,'2025-12-27':180,'2026-01-02':181},'2026-01-02'),{count:2,average:180.5});});
test('editing a daily weigh-in replaces it instead of counting it twice',()=>{const weights={'2026-10-14':180};weights['2026-10-14']=182;assert.deepEqual(averageWeight(JSON.parse(JSON.stringify(weights)),'2026-10-14'),{count:1,average:182});});
test('weight records validate positive pounds and reject corrupt storage',()=>{assert.ok(validWeight('180.25'));for(const value of ['','0','-180','abc','Infinity','180.333'])assert.equal(validWeight(value),false);assert.ok(validateWeights({'2026-10-14':180}));assert.equal(validateWeights({'2026-10-14':'180'}),false);assert.equal(validateWeights(null),false);});
