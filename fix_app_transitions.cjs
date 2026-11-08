const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The main screen transition inside <AnimatePresence mode="wait">
const oldTransition = `
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="transform-gpu flex flex-col flex-grow"
              >`;

const newTransition = `
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
                className="transform-gpu flex flex-col flex-grow w-full smooth-scroll"
              >`;

code = code.replace(oldTransition, newTransition);

// The active challenge transition
const oldChallengeTransition = `
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="min-h-screen w-full flex flex-col bg-surface-main relative z-50 transform-gpu"
`;
const newChallengeTransition = `
            layoutId={\`challenge-\${activeChallenge.id}\`}
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)', borderRadius: '3rem' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', borderRadius: '0rem' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
            className="min-h-screen w-full flex flex-col bg-surface-main relative z-50 transform-gpu overflow-hidden"
`;
code = code.replace(oldChallengeTransition, newChallengeTransition);

fs.writeFileSync('src/App.tsx', code);
