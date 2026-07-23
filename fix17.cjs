const fs = require('fs');

function replaceLine(file) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Điểm: {c.score}</span>')) {
      lines[i] = '                                  <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">Điểm: {c.score}</span>';
    }
  }
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

replaceLine('src/pages/HeadDashboard.jsx');
replaceLine('src/pages/SecretaryDashboard.jsx');