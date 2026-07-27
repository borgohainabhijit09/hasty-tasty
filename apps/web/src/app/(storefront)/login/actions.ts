'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '@/auth'
import { prisma } from 'database'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (user?.role === 'PENDING_B2B') {
      await signOut({ redirect: false })
      return { error: "Your B2B account is pending admin approval." }
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
  return { success: true, redirectTo }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "User already exists" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'CUSTOMER',
      }
    })
  } catch (error) {
    console.error('Failed to create user record:', error)
    return { error: "Failed to create user" }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function b2bSignup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  
  const businessName = formData.get('businessName') as string
  const gstNumber = formData.get('gstNumber') as string
  const tradeLicense = formData.get('tradeLicense') as string
  const contactPerson = formData.get('contactPerson') as string

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "User already exists" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'PENDING_B2B',
      }
    })

    await prisma.businessProfile.create({
      data: {
        userId: user.id,
        businessName,
        gstNumber,
        contactPerson,
        tradeLicense: tradeLicense || null,
        status: 'PENDING'
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to create B2B user record:', error)
    return { error: 'Failed to create user record' }
  }
}

export async function logout() {
  await signOut({ redirect: false })
  revalidatePath('/', 'layout')
  redirect('/')
}
