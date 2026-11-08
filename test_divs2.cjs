const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');
let lines = code.split('\n');
let stack = [];
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let opens = (line.match(/<div\b/g) || []).length;
  let closes = (line.match(/<\/div>/g) || []).length;
  let mOpens = (line.match(/<motion\.div\b/g) || []).length;
  let mCloses = (line.match(/<\/motion\.div>/g) || []).length;
  
  for(let j=0; j<opens; j++) stack.push('div');
  for(let j=0; j<mOpens; j++) stack.push('motion.div');
  
  for(let j=0; j<closes; j++) {
    if(stack[stack.length-1] === 'div') stack.pop();
    else {
      console.log('Error closing div at line ' + (i+1) + ', expected ' + stack[stack.length-1]);
      stack.pop();
    }
  }
  for(let j=0; j<mCloses; j++) {
    if(stack[stack.length-1] === 'motion.div') stack.pop();
    else {
      console.log('Error closing motion.div at line ' + (i+1) + ', expected ' + stack[stack.length-1]);
      stack.pop();
    }
  }
}
