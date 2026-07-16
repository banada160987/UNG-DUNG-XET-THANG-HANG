import fs from 'fs';

function fixFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  // First, find the exact match from the first patch script where we introduced `{settings?.use_scoring !== false && {`
  // Actually, we replaced it using `!== false && (` in the powershell script, let's just make it simple.
  
  // Clean up any double `}}` at the end of the compare button
  content = content.replace(/Bàn cân đối chiếu(.*?)\)\}\}/g, 'Bàn cân đối chiếu$1)}');

  // Also clean up any `!== false && {selectedForCompare` and make it `!== false && (selectedForCompare`
  content = content.replace(/!== false && \{selectedForCompare/g, '!== false && (selectedForCompare');
  
  fs.writeFileSync(filename, content);
  console.log(`Fixed ${filename}`);
}

fixFile('src/pages/SecretaryDashboard.jsx');
fixFile('src/pages/HeadDashboard.jsx');
