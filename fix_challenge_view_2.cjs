const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

const replacement = `
  const rawTargetCode = challenge.targetCode || challenge.expectedLogic;
  const puzzleTargetCode = isFoundationPhase 
    ? rawTargetCode.replace(/^\\s*(\\/\\/|#|<!--|\\/\\*).*$/gm, '').trim() || rawTargetCode
    : rawTargetCode;

  return (
`;

code = code.replace(/return \(/, replacement);

code = code.replace(
  /targetCode=\{challenge\.targetCode \|\| challenge\.expectedLogic\}/g,
  'targetCode={puzzleTargetCode}'
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
