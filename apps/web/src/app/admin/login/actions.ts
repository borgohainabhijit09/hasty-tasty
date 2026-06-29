'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user is SUPER_ADMIN via the backend API or DB directly.
  // Since we are in a server action, we can fetch from our internal API.
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'
    const res = await fetch(`${apiUrl}/api/users/me?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      await supabase.auth.signOut();
      return { error: 'Access Denied: Could not verify admin role.' }
    }
    const userDb = await res.json();
    if (userDb.role !== 'SUPER_ADMIN') {
      await supabase.auth.signOut(); // Kick them out
      return { error: 'Access Denied: You do not have administrator privileges.' }
    }
  } catch (err) {
    await supabase.auth.signOut();
    return { error: 'Internal server error verifying role.' }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}
