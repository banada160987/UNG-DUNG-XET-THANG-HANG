const fs = require('fs');
['src/pages/SecretaryDashboard.jsx', 'src/pages/HeadDashboard.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\)\}\}/g, ')}');
  fs.writeFileSync(file, content);
});
console.log('Fixed files');
