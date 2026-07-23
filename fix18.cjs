const fs = require('fs');

function replaceLine(file) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Đã xử lý</span>')) {
      lines[i] = '                                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Đã xử lý</span>';
    }
  }
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

replaceLine('src/pages/HeadDashboard.jsx');