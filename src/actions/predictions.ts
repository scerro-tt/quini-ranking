'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { calculateAciertosPoints } from '@/lib/utils'

export async function createOrUpdatePrediction(
  jornadaId: string,
  hits: number,
  notes?: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  if (hits < 0 || hits > 14) return { error: 'Hits must be between 0-14' }

  const jornada = await db.jornada.findUnique({
    where: { id: jornadaId },
  })

  if (!jornada) throw new Error('Jornada not found')

  const prizeU = jornada.prizeU || 1.5

  // Calculate points
  let points = 0
  if (hits >= 10) {
    // If 10+ hits, check if there's a prize
    const prizes = await db.prize.findMany({
      where: { jornadaId, hits },
    })
    if (prizes.length > 0) {
      points = prizes.reduce((sum, p) => sum + p.amount, 0)
    } else {
      // No prize, but it's still 100% of U
      points = prizeU
    }
  } else {
    // Below 10 hits, use aciertos points
    points = calculateAciertosPoints(hits, prizeU)
  }

  // Upsert prediction
  const prediction = await db.prediction.upsert({
    where: {
      jornadaId_userId: { jornadaId, userId: session.user.id },
    },
    update: { hits, points, rawPoints: points, notes },
    create: {
      jornadaId,
      userId: session.user.id,
      hits,
      points,
      rawPoints: points,
      notes,
    },
  })

  return { success: true, prediction }
}

export async function getPredictionsForJornada(jornadaId: string) {
  const predictions = await db.prediction.findMany({
    where: { jornadaId },
    include: { user: true },
    orderBy: { user: { nickname: 'asc' } },
  })

  return predictions
}

export async function getPredictionsForUser(seasonId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const predictions = await db.prediction.findMany({
    where: {
      user: { id: session.user.id },
      jornada: { seasonId },
    },
    include: {
      jornada: true,
    },
    orderBy: { jornada: { weekNumber: 'asc' } },
  })

  return predictions
}

export async function deletePrediction(predictionId: string) {
  const prediction = await db.prediction.findUnique({
    where: { id: predictionId },
  })

  if (!prediction) throw new Error('Prediction not found')

  await db.prediction.delete({ where: { id: predictionId } })
  return { success: true }
}
