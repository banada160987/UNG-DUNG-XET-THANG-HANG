const fs = require('fs');

function restoreIf(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /                  title=\{sortByScore \? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'\}\r?\n    displayCandidates = \[\.\.\.displayCandidates\]\.sort\(\(a, b\) => b\.score - a\.score\);/g,
    '  if (sortByScore) {\n    displayCandidates = [...displayCandidates].sort((a, b) => b.score - a.score);'
  );
  fs.writeFileSync(file, content, 'utf8');
}

restoreIf('src/pages/HeadDashboard.jsx');
restoreIf('src/pages/SecretaryDashboard.jsx');