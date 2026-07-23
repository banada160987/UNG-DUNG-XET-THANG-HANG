const fs = require('fs');

function replaceLine(file, lineIndex, newContent) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  lines[lineIndex - 1] = newContent;
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

replaceLine('src/pages/HeadDashboard.jsx', 310, '            onClick={() => setSortByScore(!sortByScore)}');
replaceLine('src/pages/SecretaryDashboard.jsx', 137, '  if (sortByScore) {');
replaceLine('src/pages/SecretaryDashboard.jsx', 299, '            onClick={() => setSortByScore(!sortByScore)}');

console.log('Fixed lines explicitly');