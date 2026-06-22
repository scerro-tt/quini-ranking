'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function createJornada(
  seasonId: string,
  weekNumber: number,
  matchDate: Date,
  prizeU?: number
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const season = await db.season.findUnique({ where: { id: seasonId } })
  if (!season) throw new Error('Season not found')

  const existing = await db.jornada.findUnique({
    where: { seasonId_weekNumber: { seasonId, weekNumber } },
  })

  if (existing) return { error: 'Week already exists in this season' }

  const jornada = await db.jornada.create({
    data: {
      seasonId,
      weekNumber,
      matchDate,
      prizeU: prizeU || 1.5,
    },
  })

  return { success: true, jornada }
}

export async function getJornadasForSeason(seasonId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const season = await db.season.findFirst({
    where: {
      id: seasonId,
      seasonUsers: { some: { userId: session.user.id } },
    },
  })

  if (!season) throw new Error('Season not found')

  const jornadas = await db.jornada.findMany({
    where: { seasonId },
    include: {
      predictions: { include: { user: true } },
      _count: { select: { prizes: true } },
    },
    orderBy: { weekNumber: 'asc' },
  })

  return jornadas
}

export async function updatePrizeU(jornadaId: string, prizeU: number) {
  const jornada = await db.jornada.findUnique({ where: { id: jornadaId } })
  if (!jornada) throw new Error('Jornada not found')

  const updated = await db.jornada.update({
    where: { id: jornadaId },
    data: { prizeU: Math.max(prizeU, 1.5) },
  })

  return { success: true, jornada: updated }
}

export async function deleteJornada(jornadaId: string) {
  const jornada = await db.jornada.findUnique({ where: { id: jornadaId } })
  if (!jornada) throw new Error('Jornada not found')

  await db.jornada.delete({ where: { id: jornadaId } })
  return { success: true }
}
