const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

if (!css.includes('.liquid-glass')) {
  css += `
.liquid-glass {
  background: var(--bg-card);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    inset 0 -1px 1px rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dark .liquid-glass {
  background-color: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px 1px rgba(255, 255, 255, 0.02);
}

.smooth-scroll {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
`;
  fs.writeFileSync('src/index.css', css);
}
