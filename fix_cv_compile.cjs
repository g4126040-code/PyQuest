const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

code = code.replace(
  /return \(\n\n    <motion\.div/,
  'return (\n    <div className="flex flex-col h-full w-full relative">\n      <motion.div'
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
