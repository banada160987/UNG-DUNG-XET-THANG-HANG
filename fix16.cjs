const fs = require('fs');

function replaceLine(file, lineIndex, newContent) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  lines[lineIndex - 1] = newContent;
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

replaceLine('src/pages/HeadDashboard.jsx', 313, "                  {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");
replaceLine('src/pages/SecretaryDashboard.jsx', 302, "                  {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");

console.log('Fixed button text content');