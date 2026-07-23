const fs = require('fs');
const path = require('path');

const custom = {
  'XÃ C': 'XÁC',
  'nÃ y': 'này',
  'ChÃ o': 'Chào',
  'nÃ o': 'nào',
  'chá» n': 'chọn',
  'Chá» ': 'Chờ',
  'hÃ ng': 'hàng',
  'Trưá» ng': 'Trường',
  'Phưá» ng': 'Phường',
  'Ä ắc Lắk': 'Đắk Lắk',
  'Ä ắk Lắk': 'Đắk Lắk',
  'Ä ôn đốc': 'Đôn đốc',
  'Ä ã': 'Đã',
  'Ä ang': 'Đang',
  'Ä iểm': 'Điểm',
  'BÃ n cân': 'Bàn cân',
  'Ä K': 'ĐK',
  'điá» u kiện': 'điều kiện',
  'bá»‹': 'bị',
  'khÃ¡ch hÃ ng': 'khách hàng',
  'xÃ¡c nháºn': 'xác nhận',
  'Ä‘Äƒng nháºp': 'đăng nhập'
};

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [k, v] of Object.entries(custom)) {
    content = content.split(k).join(v);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist') continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.html') || p.endsWith('.json')) {
      fixMojibake(p);
    }
  }
}

walk('.');