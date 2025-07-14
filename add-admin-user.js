const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase project URL and service role key
const supabase = createClient(
  'https://iwemxnniterxwqzdrqka.supabase.co', // Your project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZW14bm5pdGVyeHdxemRycWthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3ODAwMCwiZXhwIjoyMDY4MDU0MDAwfQ.-ZSUuAD3N3GuO4SGgp_59m7AJvWIt96ZvRY2Z_0uYbw' // Your service role key
);

const user = {
  email: 'gitongalewis@students.uonbi.ac.ke',
  password: '#Toshlewi254',
  username: 'gitongalewis',
  full_name: 'Lewis Gitonga'
};

async function ensureAdminUser() {
  // 1. Create user in Auth (if not exists)
  let { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      username: user.username,
      full_name: user.full_name
    }
  });

  let userId;
  if (error && error.message && error.message.includes('User already registered')) {
    // User exists, fetch their ID
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    if (fetchError || !profile) {
      console.error('Could not fetch user ID:', fetchError || 'User not found in profiles');
      return;
    }
    userId = profile.id;
  } else if (data && data.user) {
    userId = data.user.id;
  } else {
    console.error('Error creating user:', error);
    return;
  }

  // 2. Upsert profile with is_admin = true
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([{
      id: userId,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`,
      is_admin: true
    }], { onConflict: 'id' });

  if (profileError) {
    console.error('Error upserting profile:', profileError);
  } else {
    console.log('Admin user ensured:', user.email);
  }
}

ensureAdminUser(); 