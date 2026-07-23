const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if(k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = env;
const headers = { 'apikey': VITE_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + VITE_SUPABASE_ANON_KEY };

async function check() {
  const r1 = await fetch(VITE_SUPABASE_URL + '/rest/v1/heads?limit=1', { headers }).then(r => r.json());
  console.log('heads columns:', r1.length > 0 ? Object.keys(r1[0]) : (r1.message || 'no rows'));
  const r2 = await fetch(VITE_SUPABASE_URL + '/rest/v1/secretaries?limit=1', { headers }).then(r => r.json());
  console.log('secretaries columns:', r2.length > 0 ? Object.keys(r2[0]) : (r2.message || 'no rows'));
  const r3 = await fetch(VITE_SUPABASE_URL + '/rest/v1/settings?limit=1', { headers }).then(r => r.json());
  console.log('settings columns:', r3.length > 0 ? Object.keys(r3[0]) : (r3.message || 'no rows'));
}
check();