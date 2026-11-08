const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const replacement = `
            <div key={stageData.id} className="w-full flex flex-col items-center">
              {stageData.id === 11 && (
                <div className="w-full max-w-2xl mx-auto mb-14 text-center bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-purple-500/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                  <Crown className="w-14 h-14 mx-auto mb-3 text-yellow-300 relative z-10 drop-shadow-md" />
                  <h3 className="text-3xl font-black mb-2 relative z-10">{t('Foundation Phase Complete!')}</h3>
                  <p className="text-white/90 font-semibold relative z-10 text-lg">{t('You have earned the Legendary rank. Welcome to the Advanced curriculum.')}</p>
                </div>
              )}
              {/* Stage Header */}
`;

code = code.replace(
  /<div key=\{stageData\.id\} className="w-full flex flex-col items-center">\n\s*\{\/\* Stage Header \*\/\}/g,
  replacement
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
