const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert a validation layer effect
const effectCode = `
  // Validation Layer: Ensure active challenge matches the selected language track
  useEffect(() => {
    if (activeChallengeId) {
      const challenge = challenges.find(c => c.id === activeChallengeId);
      if (challenge && challenge.trackId !== progress.currentLanguage) {
        // Only allow if it's python to python_practice, otherwise force to current language
        if (!(progress.currentLanguage === 'python' && challenge.trackId === 'python_practice')) {
          setActiveChallengeId(null);
        }
      }
    }
  }, [activeChallengeId, progress.currentLanguage]);
`;

code = code.replace(
  /const activeChallenge = challenges\.find\(c => c\.id === activeChallengeId\);/,
  effectCode + '\n  const activeChallenge = challenges.find(c => c.id === activeChallengeId);'
);

fs.writeFileSync('src/App.tsx', code);
