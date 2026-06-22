'use server'

import { db } from '@/lib/db'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function generateInvitation(email: string, nickname: string) {
  // Verificar que no exista ya
  const existing = await db.invitation.findUnique({ where: { email } })
  if (existing) {
    return { error: 'Ya existe invitación para este email' }
  }

  const existingUser = await db.user.findFirst({
    where: { OR: [{ email }, { nickname }] }
  })
  if (existingUser) {
    return { error: 'Email o nickname ya registrado' }
  }

  // Generar token único
  const token = crypto.randomBytes(32).toString('hex')

  // Expiración: 30 días
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const invitation = await db.invitation.create({
    data: {
      email,
      nickname,
      token,
      expiresAt,
    },
  })

  // Generar URL de invitación
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${token}`

  // Enviar email
  const emailResult = await sendInvitationEmail(email, nickname, invitationUrl)

  if (emailResult.error) {
    // Eliminar invitación si el email falla
    await db.invitation.delete({ where: { id: invitation.id } })
    return { error: 'Error al enviar email de invitación' }
  }

  return {
    success: true,
    invitation,
    invitationUrl,
    message: `✓ Invitación enviada a ${email}`
  }
}

export async function validateInvitationToken(token: string) {
  const invitation = await db.invitation.findUnique({
    where: { token }
  })

  if (!invitation) {
    return { error: 'Invitación no válida' }
  }

  if (invitation.used) {
    return { error: 'Esta invitación ya fue utilizada' }
  }

  if (invitation.expiresAt < new Date()) {
    return { error: 'La invitación ha expirado' }
  }

  return {
    success: true,
    invitation,
    email: invitation.email,
    nickname: invitation.nickname
  }
}

export async function redeemInvitation(token: string, password: string) {
  // Validar invitación
  const invitation = await db.invitation.findUnique({
    where: { token }
  })

  if (!invitation) {
    return { error: 'Invitación no válida' }
  }

  if (invitation.used) {
    return { error: 'Esta invitación ya fue utilizada' }
  }

  if (invitation.expiresAt < new Date()) {
    return { error: 'La invitación ha expirado' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  // Crear usuario
  const { hash } = await import('bcryptjs')
  const passwordHash = await hash(password, 10)

  const user = await db.user.create({
    data: {
      email: invitation.email,
      nickname: invitation.nickname,
      passwordHash,
    },
  })

  // Marcar invitación como usada
  await db.invitation.update({
    where: { id: invitation.id },
    data: {
      used: true,
      usedAt: new Date(),
    },
  })

  return { success: true, user }
}

export async function listInvitations() {
  const invitations = await db.invitation.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return invitations
}
