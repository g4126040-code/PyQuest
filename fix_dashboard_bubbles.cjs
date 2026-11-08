const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// The button for the bubble currently looks like:
// <button disabled={!isUnlocked} onClick={...} className="...">
//   <div className="absolute ..."> Tooltip </div>
//   <div className={`w-24 h-24 ...`}> ... </div>
// </button>

// Replace <button with <motion.button
code = code.replace(
  /<button\n\s*disabled=\{!isUnlocked\}\n\s*onClick=\{\(\) => \{\n\s*playSound\('click'\); triggerHaptic\('light'\);\n\s*onSelectChallenge\(challenge\.id\);\n\s*\}\}\n\s*className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed outline-none"\n\s*>/g,
  `<motion.button
                        layoutId={\`challenge-wrapper-\${challenge.id}\`}
                        whileTap={isUnlocked ? { scale: 0.95 } : {}}
                        disabled={!isUnlocked}
                        onClick={() => {
                          playSound('click'); triggerHaptic('light');
                          onSelectChallenge(challenge.id);
                        }}
                        className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed outline-none"
                      >`
);
code = code.replace(
  /<\/button>\n\s*\{\/\* Path line \*\/\}/g,
  `</motion.button>\n                      {/* Path line */}`
);

// We need to specifically replace the inner bubble div with motion.div layoutId
const bubbleTarget = `                        <div \n                          className={\`\n                            w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center btn-node transform-gpu\n                            \${isUnlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale'}\n                            \${isCompleted \n                              ? 'bg-emerald-500/80 backdrop-blur-xl shadow-lg ring-4 ring-emerald-500/20 text-white' \n                              : isCurrent \n                                ? \`\${stageData.colors.bg} shadow-lg ring-8 \${stageData.colors.ring} text-white\` \n                                : 'premium-glass-panel text-content-muted border-2 border-outline'}\n                          \`}\n                        >`;

const bubbleReplacement = `                        <motion.div \n                          layoutId={\`challenge-\${challenge.id}\`}\n                          className={\`\n                            w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center btn-node transform-gpu liquid-glass\n                            \${isUnlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale'}\n                            \${isCompleted \n                              ? 'bg-emerald-500/90 text-white border-emerald-400' \n                              : isCurrent \n                                ? \`\${stageData.colors.bg} text-white border-white/40 ring-4 \${stageData.colors.ring}\` \n                                : 'text-content-muted border-outline'}\n                          \`}\n                        >`;

code = code.replace(bubbleTarget, bubbleReplacement);
code = code.replace(
  /<\/div>\n\s*\{\/\* Current marker bouncing \*\/\}/g,
  `</motion.div>\n                        {/* Current marker bouncing */}`
);

// Let's also upgrade the track selector to liquid-glass
code = code.replace(
  /className={`p-6 rounded-3xl border-2 transition-all text-left \${isUnlocked \? 'cursor-pointer hover:shadow-md' : 'grayscale opacity-60'} \${selectedTrackId === track.id \? 'bg-brand-500\/10 border-brand-500 shadow-md' : 'bg-surface-main\/50 border-outline'}`}/g,
  'className={`p-6 rounded-3xl border transition-all text-left liquid-glass ${isUnlocked ? "cursor-pointer hover:shadow-lg hover:scale-[1.02]" : "grayscale opacity-60"} ${selectedTrackId === track.id ? "bg-brand-500/15 border-brand-400 shadow-xl" : "border-white/10"}`}'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
