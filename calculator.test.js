import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from './public/calculator.js';
test('calorie calculations support precedence, portions, and parentheses',()=>{assert.equal(calculate('150×2+80'),380);assert.equal(calculate('(200+100)÷2'),150);assert.equal(calculate('0.1+0.2'),.3);assert.equal(calculate('100/3'),33.33);assert.equal(calculate('-2+5'),3);});
test('invalid calculations and executable strings are rejected',()=>{for(const expression of ['','12+','1/0','1..2','(1+2','alert(1)','1;2','1e3'])assert.throws(()=>calculate(expression));});
