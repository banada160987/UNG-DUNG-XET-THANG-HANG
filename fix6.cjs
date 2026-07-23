const fs = require('fs');
const path = require('path');

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Login.jsx specific lines from screenshot:
  content = content.replace(/Tỉnh.*Lắk/, 'Tỉnh Đắk Lắk');
  content = content.replace(/>\s*Ä\s*ăng nhập\s*</, '>Đăng nhập<');
  content = content.replace(/Bản quy.*thu.*vá.*trư.*ng THPT Cao Bá Quát/, 'Bản quyền thuộc về trường THPT Cao Bá Quát');
  content = content.replace(/Ä\s*ây là lần đăng nhập/, 'Đây là lần đăng nhập');
  content = content.replace(/Tài khoản đã bị khoá tạm th.*i/, 'Tài khoản đã bị khoá tạm thời');
  content = content.replace(/Tài khoản bị khoá tạm th.*i 15 phút/, 'Tài khoản bị khoá tạm thời 15 phút');

  // Anything else? Let's generic replace:
  content = content.replace(/Ä\s*ăng nhập/g, 'Đăng nhập');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

['src/pages/HeadDashboard.jsx', 'src/pages/SecretaryDashboard.jsx', 'src/components/Layout.jsx', 'src/pages/Login.jsx'].forEach(f => {
  if (fs.existsSync(f)) fixMojibake(f);
});