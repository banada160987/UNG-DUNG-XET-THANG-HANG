const fs = require('fs');
const path = require('path');

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/X.*C NHẬN HỢP LỆ/g, 'XÁC NHẬN HỢP LỆ');
  content = content.replace(/KH.*C 'draft'/g, "KHÁC 'draft'");
  content = content.replace(/đã ch.*n/g, 'đã chọn');
  content = content.replace(/'Ch.* xử lý'/g, "'Chờ xử lý'");
  content = content.replace(/Trư.*ng THPT/g, 'Trường THPT');
  content = content.replace(/Phư.*ng Tân An/g, 'Phường Tân An');
  content = content.replace(/Tỉnh Đ.*k L.*k/g, 'Tỉnh Đắk Lắk');
  content = content.replace(/Đ.*n đốc/g, 'Đôn đốc');
  content = content.replace(/Đ.* đã xử lý/g, 'Đã xử lý');
  content = content.replace(/Đ.*ã duyệt/g, 'Đã duyệt');
  content = content.replace(/Đ.*ang xếp hạng/g, 'Đang xếp hạng');
  content = content.replace(/Đ.*iểm:/g, 'Điểm:');
  content = content.replace(/Đ.*iểm/g, 'Điểm');
  content = content.replace(/quét Đ.*K/g, 'quét ĐK');
  content = content.replace(/đi.*u kiện/g, 'điều kiện');
  
  // also fix anything else we missed using generic regex
  content = content.replace(/Trư.*ng/g, 'Trường');
  content = content.replace(/Phư.*ng/g, 'Phường');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

['src/pages/HeadDashboard.jsx', 'src/pages/SecretaryDashboard.jsx', 'src/components/Layout.jsx', 'src/pages/Login.jsx'].forEach(f => {
  if (fs.existsSync(f)) fixMojibake(f);
});