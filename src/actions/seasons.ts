'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function createSeason(name: string, startDate: Date, endDate?: Date) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const existing = await db.season.findUnique({ where: { name } })
  if (existing) return { error: 'Season name already exists' }

  const season = await db.season.create({
    data: {
      name,
      startDate,
      endDate,
      isActive: true,
    },
  })

  // Add current user to season
  await db.seasonUser.create({
    data: {
      seasonId: season.id,
      userId: session.user.id,
    },
  })

  return { success: true, season }
}

export async function getSeasonsForUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const seasons = await db.season.findMany({
    where: {
      seasonUsers: {
        some: { userId: session.user.id },
      },
    },
    include: {
      _count: { select: { jornadas: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  return seasons
}

export async function getSeasonById(seasonId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const season = await db.season.findFirst({
    where: {
      id: seasonId,
      seasonUsers: { some: { userId: session.user.id } },
    },
    include: {
      jornadas: { orderBy: { weekNumber: 'asc' } },
      rankings: { where: { userId: session.user.id } },
    },
  })

  if (!season) throw new Error('Season not found')
  return season
}

export async function updateSeason(seasonId: string, data: { name?: string; endDate?: Date; isActive?: boolean }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const season = await db.season.findFirst({
    where: {
      id: seasonId,
      seasonUsers: { some: { userId: session.user.id } },
    },
  })

  if (!season) throw new Error('Season not found')

  const updated = await db.season.update({
    where: { id: seasonId },
    data,
  })

  return { success: true, season: updated }
}

export async function deleteSeason(seasonId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const season = await db.season.findFirst({
    where: {
      id: seasonId,
      seasonUsers: { some: { userId: session.user.id } },
    },
  })

  if (!season) throw new Error('Season not found')

  await db.season.delete({ where: { id: seasonId } })
  return { success: true }
}
