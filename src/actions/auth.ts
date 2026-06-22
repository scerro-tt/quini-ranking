'use server'

import { signIn, signOut } from '@/auth'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { AuthError } from 'next-auth'

export async function register(email: string, nickname: string, password: string) {
  try {
    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { nickname }],
      },
    })

    if (existingUser) {
      return {
        error: existingUser.email === email ? 'Email ya registrado' : 'Nickname ya usado',
      }
    }

    const passwordHash = await hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        nickname,
        passwordHash,
      },
    })

    return {
      success: true,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    }
  } catch (error) {
    return { error: 'Error al registrar usuario' }
  }
}

export async function login(email: string, password: string) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      redirectTo: '/dashboard',
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return { error: 'Email o contraseña incorrectos' }
      }
    }
    return { error: 'Error al iniciar sesión' }
  }
}

export async function logout() {
  await signOut({ redirectTo: '/' })
}
