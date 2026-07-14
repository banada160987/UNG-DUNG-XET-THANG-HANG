import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdkiaypqaasqgnlfolfj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBka2lheXBxYWFzcWdubGZvbGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzIzMzIsImV4cCI6MjA5OTYwODMzMn0.jc7WLD2J2cRwz79gtUpXacXdesECAxQVEor3pFjXDe0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const { data, error } = await supabase.from('candidates').insert([{
    fullName: 'Test User',
    dob: '1990-01-01',
    gender: 'Nam',
    ethnicity: 'Kinh',
    unit: 'Test Unit',
    currentTitle: 'Test Title',
    targetTitle: 'Hạng II',
    dateRecruitment: '2020-01-01',
    dateProbationEnd: '2021-01-01',
    dateAppointment: '2021-01-01',
    dateSalaryRaise: '2022-01-01',
    degreeBachelor: true,
    degreeMaster: false,
    degreePhD: false,
    degreeOther: false,
    certIT: true,
    certLanguage: true,
    reviewDoc: true,
    achievements: []
  }]);
  
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

testInsert();
