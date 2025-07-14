import { supabase } from './supabaseClient'

export async function registerUser({ email, password, username, fullName, phone, avatar }) {
  console.log("Starting registration...");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName, phone, avatar }
    }
  });
  console.log("Auth signUp finished", { data, error });
  if (error) {
    // Improved error logging
    console.error("Supabase register error:", error, JSON.stringify(error, null, 2));
    throw new Error(error.message || error.error_description || "Registration failed");
  }
  // 2. Insert into profiles table
  const user = data.user;
  if (user) {
    console.log("Inserting into profiles...");
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: user.id,
      username,
      full_name: fullName,
      email,
      phone,
      avatar
    }]);
    console.log("Profile insert finished", { profileError });
    if (profileError) {
      // Improved error logging for profile insert
      console.error("Supabase profile insert error:", profileError, JSON.stringify(profileError, null, 2));
      throw new Error(profileError.message || "Profile creation failed");
    }
  }
  console.log("Registration complete!");
  return data;
}

export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error("Supabase login error:", error, JSON.stringify(error, null, 2));
    throw new Error(error.message || error.error_description || "Login failed");
  }
  // Check if user is banned
  const user = data.user;
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('banned')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) {
      console.error("Profile fetch error during login:", profileError);
      throw new Error("Login failed: could not verify user status");
    }
    if (profile && profile.banned) {
      throw new Error("Your account has been banned. Please contact support.");
    }
  }
  return data
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle to avoid error if no row
  if (error) throw error;
  return data;
} 