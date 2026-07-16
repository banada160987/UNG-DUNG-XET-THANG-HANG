import fs from 'fs';

const patchFile = (filename) => {
  let content = fs.readFileSync(filename, 'utf8');
  let changed = false;

  // 1. Hide sort button
  const sortBtnOrig = `<button \n                    onClick={() => setSortByScore(!sortByScore)}\n                    className={\`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors \${sortByScore ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}\`}\n                  >\n                    {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}\n                  </button>`;
  const sortBtnNew = `{settings?.use_scoring !== false && (\n                    <button \n                      onClick={() => setSortByScore(!sortByScore)}\n                      className={\`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors \${sortByScore ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}\`}\n                    >\n                      {sortByScore ? 'Đang xếp hạng theo Điểm' : 'Sắp xếp theo Điểm'}\n                    </button>\n                  )}`;
  
  if (content.includes(sortBtnOrig)) {
    content = content.replace(sortBtnOrig, sortBtnNew);
    changed = true;
  }

  // 2. Hide Compare button
  // For HeadDashboard & SecretaryDashboard, the compare button is usually:
  // {selectedForCompare.length >= 2 && ( ... Bàn cân đối chiếu ... )}
  // I will just search for Bàn cân đối chiếu
  const compareBtnRegex = /\{selectedForCompare\.length >= 2 && \([\s\S]*?Bàn cân đối chiếu[\s\S]*?<\/button>\s*\)\}/g;
  content = content.replace(compareBtnRegex, match => {
    changed = true;
    return `{settings?.use_scoring !== false && ${match}}`;
  });

  // 3. Hide Checkbox for compare
  const checkboxRegex = /(<input \s*type="checkbox"[\s\S]*?checked=\{selectedForCompare\.includes\(c\.id\)\}[\s\S]*?\/>)/g;
  content = content.replace(checkboxRegex, match => {
    changed = true;
    return `{settings?.use_scoring !== false && (\n                      ${match}\n                    )}`;
  });

  // 4. Hide Score label
  const scoreRegex = /(<span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Điểm: \{c\.score\}<\/span>)/g;
  content = content.replace(scoreRegex, match => {
    changed = true;
    return `{settings?.use_scoring !== false && (\n                        ${match}\n                      )}`;
  });

  if (changed) {
    fs.writeFileSync(filename, content);
    console.log(`Updated ${filename}`);
  } else {
    console.log(`No changes made to ${filename}`);
  }
};

patchFile('src/pages/HeadDashboard.jsx');
patchFile('src/pages/SecretaryDashboard.jsx');
