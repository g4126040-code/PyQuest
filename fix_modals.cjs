const fs = require('fs');

function upgradeModal(path) {
  let code = fs.readFileSync(path, 'utf8');
  
  code = code.replace(
    /className="bg-\[#1e1e2e\] w-full max-w-3xl rounded-2xl border border-\[#313244\] shadow-2xl overflow-hidden flex flex-col max-h-\[85vh\]"/g,
    'className="liquid-glass w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"'
  );
  
  code = code.replace(
    /className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black\/60 backdrop-blur-sm"/g,
    'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-main/80 backdrop-blur-md"'
  );
  
  fs.writeFileSync(path, code);
}

upgradeModal('src/components/CodeViewerModal.tsx');
if (fs.existsSync('src/components/PreviewModal.tsx')) {
  upgradeModal('src/components/PreviewModal.tsx');
}

