const fs = require('fs');

function fixLine(file, searchStr, replaceStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(file, content, 'utf8');
}

fixLine('src/pages/HeadDashboard.jsx', 'Đã duyệt & Chuyển\"', 'title=\"Đã duyệt & Chuyển\"');
fixLine('src/pages/HeadDashboard.jsx', "Đang xếp hạng theo Ä iểm' : 'Sắp xếp theo Ä iểm'}", "{sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");
fixLine('src/pages/SecretaryDashboard.jsx', "Đang xếp hạng theo Ä iểm' : 'Sắp xếp theo Ä iểm'}", "{sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}");
