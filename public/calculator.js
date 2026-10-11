// Parse arithmetic directly; never execute user input as JavaScript.
export function calculate(expression) {
  const source=expression.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s/g,'');
  if(!source||source.length>200||/[^\d.+*/()\-]/.test(source))throw Error('Enter a calculation');
  const tokens=source.match(/\d*\.\d+|\d+\.?|[()+*/-]/g)||[];
  if(tokens.join('')!==source)throw Error('Check the calculation');
  let index=0;
  function factor(){const token=tokens[index++];if(token==='+'||token==='-')return(token==='-'?-1:1)*factor();if(token==='('){const value=sum();if(tokens[index++]!==')')throw Error('Close the parentheses');return value;}if(!token||!/^\d*\.?\d+\.?$/.test(token))throw Error('Finish the calculation');return Number(token);}
  function product(){let value=factor();while(tokens[index]==='*'||tokens[index]==='/'){const op=tokens[index++],next=factor();if(op==='/'&&next===0)throw Error('Cannot divide by zero');value=op==='*'?value*next:value/next;}return value;}
  function sum(){let value=product();while(tokens[index]==='+'||tokens[index]==='-'){const op=tokens[index++],next=product();value=op==='+'?value+next:value-next;}return value;}
  const value=sum();if(index!==tokens.length||!Number.isFinite(value))throw Error('Check the calculation');return Math.round((value+Number.EPSILON)*100)/100;
}
