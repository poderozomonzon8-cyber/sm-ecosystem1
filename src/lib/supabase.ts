import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL ?? 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? 'your-anon-public-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Custom hooks to replace Anima SDK
export async function supabaseQuery(table: string, options: any = {}): Promise<any[]> {
  let query = supabase.from(table).select('*')
  
  if (options.orderBy) {
    const [field, direction] = options.orderBy.split(':')
    query = query.order(field, { ascending: direction === 'asc' })
  } else {
    query = query.order('created_at', { ascending: false })
  }
  
  if (options.limit) query = query.limit(options.limit)
  if (options.range) query = query.range(options.range[0], options.range[1])
  
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function supabaseMutation(table: string, id: string | null, values: any) {
  if (id) {
    // Update
    const { error } = await supabase.from(table).update(values).eq('id', id)
    if (error) throw error
  } else {
    // Create
    const { data, error } = await supabase.from(table).insert([values]).select().single()
    if (error) throw error
    return data
  }
}

// Auth
export async function supabaseSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function supabaseSignOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Profiles query (for current user)
export async function getUserProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

// Already exported above: export const supabase = ...
