const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

code = code.replace(
  /const isFoundationPhase = challenge\.trackId !== 'python_practice' && \(challenge\.level <= 50 \|\| challenge\.trackId === 'python'\);/,
  "const isFoundationPhase = challenge.trackId !== 'python_practice' && challenge.level <= 50;"
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
