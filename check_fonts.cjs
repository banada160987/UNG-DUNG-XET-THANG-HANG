const fs = require('fs');
const files = [
  'src/pages/TeacherDashboard.jsx',
  'src/pages/HeadDashboard.jsx',
  'src/pages/SecretaryDashboard.jsx',
  'src/pages/AdminDashboard.jsx',
  'src/components/ReportGenerator.jsx'
];

for(let f of files) {
  if (fs.existsSync(f)) {
    const txt = fs.readFileSync(f, 'utf8');
    if (txt.includes('\uFFFD') || txt.includes('vá» i')) {
      console.log('CORRUPTED FONT IN:', f);
    }
  }
}
console.log('Check complete.');
