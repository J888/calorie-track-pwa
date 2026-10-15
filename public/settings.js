export const SETTINGS_KEY='daily-profile-v1';
export function validSettings(value){return value!==null&&typeof value==='object'&&Number.isInteger(value.feet)&&value.feet>=0&&value.feet<=8&&Number.isFinite(value.inches)&&value.inches>=0&&value.inches<12&&value.feet*12+value.inches>=12&&Number.isInteger(value.age)&&value.age>=1&&value.age<=130;}
export function bmiFor(weight,settings){if(!validSettings(settings)||!Number.isFinite(weight)||weight<=0)return null;return Math.round(weight*703/(settings.feet*12+settings.inches)**2*10)/10;}
