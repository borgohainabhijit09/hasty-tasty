'use server'

import { signOut } from '@/auth'

export async function adminLogout() {
  await signOut({ redirectTo: '/admin/login' })
}
