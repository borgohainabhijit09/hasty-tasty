'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
    const { data: dbUser } = await supabase.from('User').select('role').eq('id', authData.user.id).single()
    if (dbUser?.role === 'PENDING_B2B') {
      await supabase.auth.signOut();
      return { error: "Your B2B account is pending admin approval." }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, redirectTo }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Automatically sync the newly created auth user to our custom "User" table
  if (data.user) {
    const { error: dbError } = await supabase.from('User').insert({
      id: data.user.id,
      email: data.user.email,
      password: password, // As required by your schema
      name: name,
      phone: phone || null,
      role: 'CUSTOMER',
      updatedAt: new Date().toISOString()
    })

    if (dbError) {
      console.error('Failed to create user record in User table:', dbError)
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function b2bSignup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  
  // Business details
  const businessName = formData.get('businessName') as string
  const gstNumber = formData.get('gstNumber') as string
  const tradeLicense = formData.get('tradeLicense') as string
  const contactPerson = formData.get('contactPerson') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Insert into User with PENDING_B2B role
    const { error: dbError } = await supabase.from('User').insert({
      id: data.user.id,
      email: data.user.email,
      password: password, // Keep sync consistent with regular signup
      name: name,
      phone: phone || null,
      role: 'PENDING_B2B',
      updatedAt: new Date().toISOString()
    })

    if (dbError) {
      console.error('Failed to create B2B user record:', dbError)
      return { error: 'Failed to create user record' }
    }

    // Insert Business Profile
    const { error: bizError } = await supabase.from('BusinessProfile').insert({
      id: crypto.randomUUID(),
      userId: data.user.id,
      businessName,
      gstNumber,
      contactPerson,
      tradeLicense: tradeLicense || null,
      status: 'PENDING'
    })

    if (bizError) {
      console.error('Failed to create Business Profile:', bizError)
      return { error: 'Failed to save business profile details' }
    }
    
    // We must sign them out immediately since they are not approved yet
    await supabase.auth.signOut()
    
    return { success: true }
  }
  
  return { error: 'Unknown error occurred during B2B signup' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/')
}
