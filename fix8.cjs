const fs = require('fs');
let content = fs.readFileSync('src/pages/HeadDashboard.jsx', 'utf8');
content = content.replace(/đã chọng 'Chờ xử lý'\)\./, "đã chọn (chỉ duyệt hồ sơ đang 'Chờ xử lý').");
fs.writeFileSync('src/pages/HeadDashboard.jsx', content, 'utf8');