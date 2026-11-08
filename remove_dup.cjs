const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /  const trackChallenges = challenges\.filter\(c => c\.trackId === selectedTrackId\);\n  const conceptMap:/,
  '  const conceptMap:'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
