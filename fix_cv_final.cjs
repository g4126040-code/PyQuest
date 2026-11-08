const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

// Revert the outer div I added
code = code.replace(
  /return \(\n    <div className="flex flex-col h-full w-full relative">\n      <motion\.div/g,
  'return (\n    <>\n      <motion.div'
);

// End of file
// I replaced:
//       </motion.div>
//       <CodeViewerModal isOpen={showCodeViewer} onClose={() => setShowCodeViewer(false)} code={code} language={trackToPrism[challenge.trackId] || "python"} />
//       <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} code={code} language={challenge.trackId} />
//     </div>
//   );
// }

code = code.replace(
  /<\/motion\.div>\n      <CodeViewerModal isOpen=\{showCodeViewer\} onClose=\{\(\) => setShowCodeViewer\(false\)\} code=\{code\} language=\{trackToPrism\[challenge\.trackId\] \|\| "python"\} \/>\n      <PreviewModal isOpen=\{showPreview\} onClose=\{\(\) => setShowPreview\(false\)\} code=\{code\} language=\{challenge\.trackId\} \/>\n    <\/div>\n  \);\n\}/g,
  '      </motion.div>\n      <CodeViewerModal isOpen={showCodeViewer} onClose={() => setShowCodeViewer(false)} code={code} language={trackToPrism[challenge.trackId] || "python"} />\n      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} code={code} language={challenge.trackId} />\n    </>\n  );\n}'
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
