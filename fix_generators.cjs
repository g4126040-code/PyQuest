const fs = require('fs');

let foundationCode = fs.readFileSync('src/data/foundation.ts', 'utf8');
foundationCode = foundationCode.replace('function getFoundationTargetCode', 'export function getFoundationTargetCode');

let genCode = fs.readFileSync('src/data/generators.ts', 'utf8');

// Insert the foundationCode at the top
genCode = foundationCode + '\n' + genCode;

// Inside generateTrackContent, replace the giant if/else logic with getFoundationTargetCode for level <= 50
const replacement = `
export function generateTrackContent(trackId: string, level: number, concept: string, trackName: string) {
  let targetCode = "";
  let expectedLogic = "";
  let initialCode = "";
  
  if (level <= 50) {
    targetCode = getFoundationTargetCode(trackId, level);
    expectedLogic = "The user must implement the correct foundation concept.";
    initialCode = "// " + concept + "\\n";
  } else {
    // For levels > 50, use fallback generic targetCode
    targetCode = "// Target code for " + concept + "\\n// Advanced implementation";
    expectedLogic = "The user must implement advanced logic for " + concept + ".";
    initialCode = "// " + concept + "\\n";
  }
`;

// Replace the start of generateTrackContent until `// Handle specific projects`
genCode = genCode.replace(/export function generateTrackContent\([\s\S]*?\/\/ Handle specific projects/, replacement + '\n\n  // Handle specific projects');

fs.writeFileSync('src/data/generators.ts', genCode);
