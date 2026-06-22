'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function calculateAndSaveRanking(seasonId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const season = await db.season.findUnique({
    where: { id: seasonId },
    include: {
      seasonUsers: true,
      jornadas: {
        include: {
          predictions: true,
          prizes: true,
        },
      },
    },
  })

  if (!season) throw new Error('Season not found')

  // Calculate ranking for each user in the season
  const rankings = []

  for (const seasonUser of season.seasonUsers) {
    const userId = seasonUser.userId

    // Get all predictions for this user in this season
    const predictions = await db.prediction.findMany({
      where: {
        userId,
        jornada: { seasonId },
      },
      include: { jornada: true },
    })

    // Get all prizes for this user in this season
    const prizes = await db.prize.findMany({
      where: {
        jornada: { seasonId },
      },
    })

    let totalPrizes = 0
    let totalPoints = 0
    let rawPoints = 0

    // Sum up premios (real money won)
    for (const prize of prizes) {
      totalPrizes += prize.amount
    }

    // Sum up aciertos points
    for (const pred of predictions) {
      rawPoints += pred.rawPoints || 0

      // Only count aciertos if user has won at least one prize
      if (totalPrizes > 0) {
        totalPoints += pred.points || 0
      }
    }

    // Mark user as having won a prize if they have any
    if (totalPrizes > 0 && !seasonUser.hasWonPrize) {
      await db.seasonUser.update({
        where: { id: seasonUser.id },
        data: { hasWonPrize: true },
      })
    }

    // Valid points = total points ONLY if user has won a prize
    const validPoints = totalPrizes > 0 ? totalPoints : 0

    // Total score = premios + aciertos válidos
    const totalScore = totalPrizes + validPoints

    rankings.push({
      userId,
      totalPrizes,
      totalPoints,
      validPoints,
      rawPoints,
      totalScore,
    })
  }

  // Sort by total score descending
  rankings.sort((a, b) => b.totalScore - a.totalScore)

  // Handle ties: if two users have same score and both haven't won, compare rawPoints
  const sortedRankings = rankings.map((r, idx) => {
    let position = idx + 1

    // Tiebreaker: if tied, check rawPoints
    if (idx > 0 && rankings[idx - 1].totalScore === r.totalScore) {
      if (r.totalPrizes === 0 && rankings[idx - 1].totalPrizes === 0) {
        // Both haven't won, tie at bottom
        position = rankings[idx - 1].position || idx
      }
    }

    return { ...r, position }
  })

  // Save or update ranking results
  for (const ranking of sortedRankings) {
    await db.rankingResult.upsert({
      where: {
        seasonId_userId: { seasonId, userId: ranking.userId },
      },
      update: {
        totalPrizes: ranking.totalPrizes,
        totalPoints: ranking.totalPoints,
        validPoints: ranking.validPoints,
        rawPoints: ranking.rawPoints,
        position: ranking.position,
      },
      create: {
        seasonId,
        userId: ranking.userId,
        totalPrizes: ranking.totalPrizes,
        totalPoints: ranking.totalPoints,
        validPoints: ranking.validPoints,
        rawPoints: ranking.rawPoints,
        position: ranking.position,
      },
    })
  }

  return { success: true, rankings: sortedRankings }
}

export async function getRankingForSeason(seasonId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const season = await db.season.findUnique({ where: { id: seasonId } })
  if (!season) throw new Error('Season not found')

  const rankings = await db.rankingResult.findMany({
    where: { seasonId },
    include: { season: true },
    orderBy: { position: 'asc' },
  })

  // Fetch user info for each ranking
  const rankingsWithUsers = await Promise.all(
    rankings.map(async (r) => {
      const user = await db.user.findUnique({ where: { id: r.userId } })
      return { ...r, user }
    })
  )

  return rankingsWithUsers
}

export async function getMyRankingInSeason(seasonId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const ranking = await db.rankingResult.findUnique({
    where: {
      seasonId_userId: { seasonId, userId: session.user.id },
    },
  })

  return ranking || null
}
