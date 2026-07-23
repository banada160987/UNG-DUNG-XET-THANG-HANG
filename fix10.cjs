const fs = require('fs');

function replaceLineWithKeyword(file, keyword, newContent) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let changed = false;
  for(let i = 0; i < lines.length; i++) {
    if(lines[i].includes(keyword)) {
      lines[i] = newContent;
      changed = true;
    }
  }
  if(changed) fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

replaceLineWithKeyword('src/pages/HeadDashboard.jsx', 'sortByScore', "                  {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");
replaceLineWithKeyword('src/pages/SecretaryDashboard.jsx', 'sortByScore', "                  {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");