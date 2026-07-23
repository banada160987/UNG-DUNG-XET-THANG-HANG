const fs = require('fs');

function fixLine(file, searchStr, replaceStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(file, content, 'utf8');
}

fixLine('src/pages/HeadDashboard.jsx', "{sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}", "title={sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");
fixLine('src/pages/SecretaryDashboard.jsx', "{sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}", "title={sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");