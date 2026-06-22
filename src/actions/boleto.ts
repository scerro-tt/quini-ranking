'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { readBoletoFromBase64 } from '@/lib/claude-vision'
import fs from 'fs'
import path from 'path'

export async function uploadAndProcessBoleto(
  jornadaId: string,
  base64Image: string,
  mediaType: string = 'image/jpeg'
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  try {
    // Verificar que la jornada existe
    const jornada = await db.jornada.findUnique({
      where: { id: jornadaId },
      include: { predictions: { where: { userId: session.user.id } } },
    })

    if (!jornada) {
      return { error: 'Jornada not found' }
    }

    // Procesar imagen con Claude Vision
    const extractedData = await readBoletoFromBase64(base64Image, mediaType)

    if (extractedData.confidence === 'low') {
      return {
        error: 'No se pudo leer el boleto claramente. Por favor intenta con una imagen mejor.',
      }
    }

    // Guardar imagen en filesystem
    const boletosDir = path.join(process.cwd(), 'public', 'boletos')
    if (!fs.existsSync(boletosDir)) {
      fs.mkdirSync(boletosDir, { recursive: true })
    }

    const fileName = `${jornadaId}_${session.user.id}_${Date.now()}.${
      mediaType === 'image/png' ? 'png' : 'jpg'
    }`
    const filePath = path.join(boletosDir, fileName)
    const buffer = Buffer.from(base64Image, 'base64')
    fs.writeFileSync(filePath, buffer)

    const imageUrl = `/boletos/${fileName}`

    // Crear o actualizar Prediction
    let prediction = jornada.predictions[0]

    if (!prediction) {
      prediction = await db.prediction.create({
        data: {
          jornadaId,
          userId: session.user.id,
          hits: 0,
          points: 0,
          boletoImageUrl: imageUrl,
          boletoUploadDate: new Date(),
        },
      })
    } else {
      prediction = await db.prediction.update({
        where: { id: prediction.id },
        data: {
          boletoImageUrl: imageUrl,
          boletoUploadDate: new Date(),
        },
      })
    }

    // Eliminar PartidoResults anteriores
    await db.partidoResult.deleteMany({
      where: { predictionId: prediction.id },
    })

    // Crear PartidoResults a partir de datos extraídos
    const partidoResults = await Promise.all(
      extractedData.partidos.map((partido) =>
        db.partidoResult.create({
          data: {
            predictionId: prediction.id,
            numero: partido.numero,
            equipo1: partido.equipo1,
            equipo2: partido.equipo2,
            userPrediction: partido.prediction,
            userPleonoPrediction: partido.pleonoPrediction,
          },
        })
      )
    )

    return {
      success: true,
      prediction,
      partidoResults,
      extractedData,
      message: `✓ Boleto procesado: ${extractedData.partidos.length} partidos extraídos`,
    }
  } catch (error) {
    console.error('Error uploading boleto:', error)
    return { error: 'Error al procesar boleto' }
  }
}

export async function getPredictionWithPartidos(predictionId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const prediction = await db.prediction.findUnique({
    where: { id: predictionId },
    include: {
      partidoResults: { orderBy: { numero: 'asc' } },
      jornada: true,
    },
  })

  if (!prediction) {
    return { error: 'Prediction not found' }
  }

  return { success: true, prediction }
}

export async function updatePartidoResult(
  partidoId: string,
  actualResult: string,
  actualPleonoResult: number
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const partido = await db.partidoResult.findUnique({
    where: { id: partidoId },
    include: { prediction: true },
  })

  if (!partido) {
    return { error: 'Partido not found' }
  }

  // Validar que el usuario sea dueño de la predicción
  if (partido.prediction.userId !== session.user.id) {
    return { error: 'Not authorized' }
  }

  const isCorrect = partido.userPrediction === actualResult

  const updated = await db.partidoResult.update({
    where: { id: partidoId },
    data: {
      actualResult,
      actualPleonoResult,
      isCorrect,
    },
  })

  // Recalcular aciertos de la predicción
  const allPartidos = await db.partidoResult.findMany({
    where: { predictionId: partido.predictionId },
  })

  const totalHits = allPartidos.filter((p) => p.isCorrect).length

  await db.prediction.update({
    where: { id: partido.predictionId },
    data: { hits: totalHits },
  })

  return { success: true, updated }
}
