const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /case 1: return \{ name: 'Bronze', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950\/30', border: 'border-orange-200 dark:border-orange-500\/20' \};/g,
  "case 1: return { name: 'Bronze', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-500/20', icon: Shield };"
);
code = code.replace(
  /case 2: return \{ name: 'Silver', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800\/50', border: 'border-slate-300 dark:border-slate-600\/50' \};/g,
  "case 2: return { name: 'Silver', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-300 dark:border-slate-600/50', icon: Shield };"
);
code = code.replace(
  /case 3: return \{ name: 'Gold', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950\/30', border: 'border-yellow-200 dark:border-yellow-500\/20' \};/g,
  "case 3: return { name: 'Gold', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-500/20', icon: Medal };"
);
code = code.replace(
  /case 4: return \{ name: 'Platinum', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950\/30', border: 'border-teal-200 dark:border-teal-500\/20' \};/g,
  "case 4: return { name: 'Platinum', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-500/20', icon: Medal };"
);
code = code.replace(
  /case 5: return \{ name: 'Diamond', color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950\/30', border: 'border-cyan-200 dark:border-cyan-500\/20' \};/g,
  "case 5: return { name: 'Diamond', color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-500/20', icon: Trophy };"
);
code = code.replace(
  /case 6: return \{ name: 'Emerald', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950\/30', border: 'border-emerald-200 dark:border-emerald-500\/20' \};/g,
  "case 6: return { name: 'Emerald', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-500/20', icon: Trophy };"
);
code = code.replace(
  /case 7: return \{ name: 'Ruby', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950\/30', border: 'border-rose-200 dark:border-rose-500\/20' \};/g,
  "case 7: return { name: 'Ruby', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-500/20', icon: Crown };"
);
code = code.replace(
  /case 8: return \{ name: 'Master', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950\/30', border: 'border-violet-200 dark:border-violet-500\/20' \};/g,
  "case 8: return { name: 'Master', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-500/20', icon: Crown };"
);
code = code.replace(
  /case 9: return \{ name: 'Grandmaster', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950\/30', border: 'border-indigo-200 dark:border-indigo-500\/20' \};/g,
  "case 9: return { name: 'Grandmaster', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-500/20', icon: Crown };"
);
code = code.replace(
  /case 10: return \{ name: 'Legendary', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950\/30', border: 'border-fuchsia-200 dark:border-fuchsia-500\/20' \};/g,
  "case 10: return { name: 'Legendary', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200 dark:border-fuchsia-500/20', icon: Crown };"
);

code = code.replace(
  /<rank.icon className="w-4 sm:w-5 h-4 sm:h-5 fill-current" \/>/g,
  '{(trackRank?.icon || rank.icon) && React.createElement(trackRank?.icon || rank.icon, { className: "w-4 sm:w-5 h-4 sm:h-5 fill-current" })}'
);

code = code.replace(
  /<div className={`flex items-center gap-1.5 sm:gap-2 font-black px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border \$\{rank\.bg\} \$\{rank\.border\} \$\{rank\.color\}/g,
  '<div className={`flex items-center gap-1.5 sm:gap-2 font-black px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border ${trackRank?.bg || rank.bg} ${trackRank?.border || rank.border} ${trackRank?.color || rank.color}'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
