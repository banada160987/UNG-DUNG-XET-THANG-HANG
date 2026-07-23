const fs = require('fs');
const path = require('path');

const customRegex = [
  { p: /X\xC3\xA0C/g, r: 'XÁC' },
  { p: /X\xC3\s+C/g, r: 'XÁC' },
  { p: /KH\xC3\s+C/g, r: 'KHÁC' },
  { p: /ch\xE1\xBB\s+n/g, r: 'chọn' },
  { p: /Ch\xE1\xBB\s+/g, r: 'Chờ ' },
  { p: /Tr\u01B0\xE1\xBB\s+ng/g, r: 'Trường' },
  { p: /Ph\u01B0\xE1\xBB\s+ng/g, r: 'Phường' },
  { p: /\xC4\s+\u1EAFk L\u1EAFk/g, r: 'Đắk Lắk' },
  { p: /\xC4\s+\xF4n \u0111\u1ED1c/g, r: 'Đôn đốc' },
  { p: /\xC4\s+\xE3/g, r: 'Đã' },
  { p: /\xC4\s+ang/g, r: 'Đang' },
  { p: /\xC4\s+i\u1EC3m/g, r: 'Điểm' },
  { p: /\xC4\s+K/g, r: 'ĐK' },
  { p: /\u0111i\xE1\xBB\s+u ki\u1EC7n/g, r: 'điều kiện' }
];

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // First normalize non-breaking spaces around mojibake chars to regular spaces
  let original = content;
  content = content.replace(/\xC3\xA0/g, 'à'); // Just in case
  
  // Quick regex replacements
  content = content.replace(/XÃ\s+C/g, 'XÁC');
  content = content.replace(/KHÃ\s+C/g, 'KHÁC');
  content = content.replace(/chá»\s+n/g, 'chọn');
  content = content.replace(/Chá»\s+/g, 'Chờ ');
  content = content.replace(/Trưá»\s+ng/g, 'Trường');
  content = content.replace(/Phưá»\s+ng/g, 'Phường');
  content = content.replace(/Ä\s+ắk Lắk/g, 'Đắk Lắk');
  content = content.replace(/Ä\s+ôn đốc/g, 'Đôn đốc');
  content = content.replace(/Ä\s+ã/g, 'Đã');
  content = content.replace(/Ä\s+ang/g, 'Đang');
  content = content.replace(/Ä\s+iểm/g, 'Điểm');
  content = content.replace(/Ä\s+K/g, 'ĐK');
  content = content.replace(/điá»\s+u kiện/g, 'điều kiện');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed regex', filePath);
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