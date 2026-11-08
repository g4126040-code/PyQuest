const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

code = code.replace(
  /const isFoundationPhase = challenge\.trackId !== 'python_practice' && challenge\.level <= 50;/,
  "const isFoundationPhase = challenge.trackId !== 'python_practice' && (challenge.level <= 50 || challenge.trackId === 'python');"
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
