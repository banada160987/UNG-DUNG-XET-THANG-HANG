const fs = require('fs');
const path = require('path');

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('k L')) {
      line = line.replace(/Tỉnh.*k L.*k/g, 'Tỉnh Đắk Lắk');
    }
    if (line.includes('n đ') && line.includes('c')) {
      line = line.replace(/.*n đốc/, 'Đôn đốc');
    }
    if (line.includes('xử lý')) {
      // Be careful not to replace 'Chờ xử lý' or 'Đã xử lý' wrongly
      if (line.includes('ã xử lý')) {
        line = line.replace(/.*ã xử lý/, 'Đã xử lý');
      }
    }
    if (line.includes('Hệ thống Xét thăng hạng viên chức')) {
      line = line.replace(/Tỉnh.*k L.*k/g, 'Tỉnh Đắk Lắk');
    }
    // Also "Ä ã duyệt & Chuyển" => "Đã duyệt & Chuyển"
    if (line.includes('duyệt & Chuyển')) {
      line = line.replace(/.*ã duyệt & Chuyển/, 'Đã duyệt & Chuyển');
    }
    if (line.includes('ang xếp hạng')) {
      line = line.replace(/.*ang xếp hạng/g, 'Đang xếp hạng');
    }
    if (line.includes('iểm:')) {
      line = line.replace(/.*iểm:/g, 'Điểm:');
    }
    if (line.includes('iểm}')) {
      line = line.replace(/.*iểm/g, 'Điểm');
    }
    if (line.includes('quét')) {
      line = line.replace(/quét.*K/g, 'quét ĐK');
    }
    
    lines[i] = line;
  }
  
  content = lines.join('\n');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

['src/pages/HeadDashboard.jsx', 'src/pages/SecretaryDashboard.jsx', 'src/components/Layout.jsx', 'src/pages/Login.jsx', 'src/pages/AdminDashboard.jsx'].forEach(f => {
  if (fs.existsSync(f)) fixMojibake(f);
});