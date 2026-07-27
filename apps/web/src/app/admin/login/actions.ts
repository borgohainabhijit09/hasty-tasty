'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '@/auth'
import { prisma } from 'database'
import { AuthError } from 'next-auth'

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  let userRole = '';

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    
    const user = await prisma.user.findUnique({ where: { email } })
    userRole = user?.role || '';
    
    if (!['SUPER_ADMIN', 'MANAGER', 'DELIVERY_BOY'].includes(userRole)) {
      await signOut({ redirect: false })
      return { error: 'Access Denied: You do not have administrator privileges.' }
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' }
        default:
          return { error: 'Something went wrong.' }
      }
    }
    throw error // Re-throw other errors (like redirects from NextAuth)
  }

  revalidatePath('/', 'layout')
  
  if (userRole === 'DELIVERY_BOY') {
    redirect('/delivery')
  } else {
    redirect('/admin')
  }
}
