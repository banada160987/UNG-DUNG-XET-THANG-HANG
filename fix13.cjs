const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/{sortByScore \? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}/g, "title={sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");
  fs.writeFileSync(file, content, 'utf8');
}

fix('src/pages/HeadDashboard.jsx');
fix('src/pages/SecretaryDashboard.jsx');