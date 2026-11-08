const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const getChapterRankFunc = `
const getChapterRank = (chapterNum: number) => {
  switch (chapterNum) {
    case 1: return { name: 'Bronze', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-500/20' };
    case 2: return { name: 'Silver', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-300 dark:border-slate-600/50' };
    case 3: return { name: 'Gold', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-500/20' };
    case 4: return { name: 'Platinum', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-500/20' };
    case 5: return { name: 'Diamond', color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-500/20' };
    case 6: return { name: 'Emerald', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-500/20' };
    case 7: return { name: 'Ruby', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-500/20' };
    case 8: return { name: 'Master', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-500/20' };
    case 9: return { name: 'Grandmaster', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-500/20' };
    case 10: return { name: 'Legendary', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200 dark:border-fuchsia-500/20' };
    default: return null;
  }
};
`;

code = code.replace(
  /const getRank = \(xp: number\) => \{/,
  getChapterRankFunc + '\nconst getRank = (xp: number) => {'
);

const trackRankLogic = `
  const trackChallengesCompleted = trackChallenges.filter(c => completedChallengeIds.includes(c.id)).length;
  const currentChapter = Math.min(10, Math.floor(trackChallengesCompleted / 5));
  const trackRank = currentChapter > 0 ? getChapterRank(currentChapter) : getChapterRank(1);
`;

code = code.replace(
  /const activeTrack = TRACKS\.find\(t => t\.id === selectedTrackId\) \|\| TRACKS\[0\];/,
  'const activeTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];\n  const trackChallenges = challenges.filter(c => c.trackId === selectedTrackId);' + trackRankLogic
);

// We should use trackRank instead of rank for the header
code = code.replace(
  /<span>\{rank\.name\} \{t\('Rank'\)\}<\/span>/g,
  '<span>{trackRank ? trackRank.name : rank.name} {t(\'Rank\')} ({activeTrack.name})</span>'
);

// Inject chapter rank inside the map
const chapterHeaderRegex = /<h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">\{t\('Chapter'\)\} \{stageData\.id\}: \{t\(stageData\.conceptKey\)\}<\/h2>/;
const chapterHeaderReplacement = `
<h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">{t('Chapter')} {stageData.id}: {t(stageData.conceptKey)}</h2>
{stageData.id <= 10 && getChapterRank(stageData.id) && (
  <div className="mt-2 mb-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md text-sm font-bold shadow-sm uppercase tracking-wider">
    {getChapterRank(stageData.id)?.name} Rank
  </div>
)}
`;

code = code.replace(chapterHeaderRegex, chapterHeaderReplacement);

fs.writeFileSync('src/components/Dashboard.tsx', code);
