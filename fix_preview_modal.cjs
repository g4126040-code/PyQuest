const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewModal.tsx', 'utf8');

code = code.replace(
  /className="bg-\[#1e1e2e\] w-full max-w-4xl rounded-2xl border border-\[#313244\] shadow-2xl overflow-hidden flex flex-col h-\[85vh\]"/g,
  'className="liquid-glass w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[85vh]"'
);

fs.writeFileSync('src/components/PreviewModal.tsx', code);
