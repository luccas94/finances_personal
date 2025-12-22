import supabase from './supabaseClient'

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

export async function signOut() {
  await supabase.auth.signOut()
}
