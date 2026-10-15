import test from 'node:test';
import assert from 'node:assert/strict';
import {bmiFor,validSettings} from './public/settings.js';
test('BMI follows pounds times 703 divided by squared total inches',()=>{assert.equal(bmiFor(200,{feet:5,inches:8,age:35}),30.4);assert.equal(bmiFor(150,{feet:5,inches:10,age:60}),21.5);assert.equal(bmiFor(150,{feet:5,inches:10,age:20}),21.5);});
test('settings reject invalid heights and ages and BMI needs valid settings',()=>{assert.ok(validSettings({feet:5,inches:8.5,age:35}));for(const settings of [null,{feet:5,inches:12,age:35},{feet:0,inches:0,age:35},{feet:5,inches:8,age:0},{feet:5,inches:8,age:1.5}]){assert.equal(validSettings(settings),false);assert.equal(bmiFor(150,settings),null);}});
