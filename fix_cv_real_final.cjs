const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

// 1. Remove the `<>` at the start
code = code.replace(
  /return \(\n    <>\n      <motion\.div/g,
  'return (\n    <motion.div'
);

// 2. Fix the closing tags at the end
// Right now they look like this:
//       </motion.div>
//       <CodeViewerModal isOpen={showCodeViewer} onClose={() => setShowCodeViewer(false)} code={code} language={trackToPrism[challenge.trackId] || "python"} />
//       <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} code={code} language={challenge.trackId} />
//     </>
//   );

code = code.replace(
  /<\/motion\.div>\n      <CodeViewerModal isOpen=\{showCodeViewer\} onClose=\{\(\) => setShowCodeViewer\(false\)\} code=\{code\} language=\{trackToPrism\[challenge\.trackId\] \|\| "python"\} \/>\n      <PreviewModal isOpen=\{showPreview\} onClose=\{\(\) => setShowPreview\(false\)\} code=\{code\} language=\{challenge\.trackId\} \/>\n    <\/>\n  \);\n\}/g,
  '      </div>\n      <CodeViewerModal isOpen={showCodeViewer} onClose={() => setShowCodeViewer(false)} code={code} language={trackToPrism[challenge.trackId] || "python"} />\n      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} code={code} language={challenge.trackId} />\n    </motion.div>\n  );\n}'
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
