const fs = require('fs');

function fixFile(file) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let matchCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('title={sortByScore')) {
      matchCount++;
      if (matchCount === 1) {
        // Line 28ish: useState
        lines[i] = '  const [sortByScore, setSortByScore] = useState(false);';
      } else if (matchCount === 2) {
        // Line 310ish: onClick
        lines[i] = '            onClick={() => setSortByScore(!sortByScore)}';
      } else if (matchCount === 3) {
        // Leave it as is, but maybe add the title prop correctly inside the element if it's broken
        lines[i] = "            title={sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}";
      }
    }
  }
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Fixed', file, 'matched', matchCount);
}

fixFile('src/pages/HeadDashboard.jsx');
fixFile('src/pages/SecretaryDashboard.jsx');