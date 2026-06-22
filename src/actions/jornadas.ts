'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function createJornada(
  seasonId: string,
  weekNumber: number,
  matchDate: Date
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/seasons/${seasonId}/jornadas/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber,
          matchDate,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Error creating jornada' }
    }

    return { success: true, jornada: data.jornada }
  } catch (error) {
    console.error('Error in createJornada:', error)
    return { error: 'Error creating jornada' }
  }
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

export async function updateJornadaPremios(
  jornadaId: string,
  premios: {
    premio10?: number
    premio11?: number
    premio12?: number
    premio13?: number
    premio14?: number
    premio15?: number
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const jornada = await db.jornada.findUnique({ where: { id: jornadaId } })
  if (!jornada) throw new Error('Jornada not found')

  const updated = await db.jornada.update({
    where: { id: jornadaId },
    data: {
      premio10: premios.premio10,
      premio11: premios.premio11,
      premio12: premios.premio12,
      premio13: premios.premio13,
      premio14: premios.premio14,
      premio15: premios.premio15,
    },
  })

  return { success: true, jornada: updated }
}
