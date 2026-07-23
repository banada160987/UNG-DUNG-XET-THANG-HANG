const fs = require('fs');
['src/pages/HeadDashboard.jsx', 'src/pages/SecretaryDashboard.jsx'].forEach(file => {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  console.log('--- ' + file + ' ---');
  lines.forEach((line, i) => {
    if (line.includes('duyệt & Chuyển') || line.includes('ang xếp hạng') || line.includes('iểm') || line.includes('quét ĐK')) {
      console.log((i+1) + ': ' + line.trim());
    }
  });
});