import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const client = new Anthropic()

interface ExtractedBoleto {
  partidos: Array<{
    numero: number
    equipo1: string
    equipo2: string
    prediction: '1' | 'X' | '2'
    pleonoPrediction: number
  }>
  confidence: 'high' | 'medium' | 'low'
  rawText: string
}

export async function readBoletoImage(imagePath: string): Promise<ExtractedBoleto> {
  // Leer imagen como base64
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = imageBuffer.toString('base64')
  const mediaType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'

  const prompt = `Eres un experto en leer boletos de Quiniela (lotería deportiva española).

Analiza esta imagen de un boleto de Quiniela y extrae la siguiente información:

1. Para CADA partido (del 1 al 14):
   - Número del partido (1-14)
   - Nombres de los equipos (Team1 vs Team2)
   - Pronóstico marcado (1 para local gana, X para empate, 2 para visitante gana)
   - Predicción de goles para el Pleno al Quince (un número entre 0-10)

Por favor responde en formato JSON con esta estructura exacta:
{
  "partidos": [
    {
      "numero": 1,
      "equipo1": "Team A",
      "equipo2": "Team B",
      "prediction": "1",
      "pleonoPrediction": 2
    },
    ...
  ],
  "confidence": "high|medium|low",
  "rawText": "texto extraído del boleto"
}

IMPORTANTE:
- Si no puedes leer claramente algo, usa "confidence": "low"
- El pronóstico DEBE ser "1", "X" o "2"
- El Pleno al Quince es un número de goles
- Si faltan partidos, indica cuántos faltan en el rawText

Responde SOLO con el JSON, sin explicaciones adicionales.`

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    // Extraer texto de respuesta
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Parsear JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo parsear respuesta JSON')
    }

    const result = JSON.parse(jsonMatch[0]) as ExtractedBoleto

    return result
  } catch (error) {
    console.error('Error reading boleto:', error)
    throw new Error('Error al procesar imagen del boleto con IA')
  }
}

export async function readBoletoFromBase64(base64Data: string, mediaType: string = 'image/jpeg'): Promise<ExtractedBoleto> {
  const prompt = `Eres un experto en leer boletos de Quiniela (lotería deportiva española).

Analiza esta imagen de un boleto de Quiniela y extrae la siguiente información:

1. Para CADA partido (del 1 al 14):
   - Número del partido (1-14)
   - Nombres de los equipos (Team1 vs Team2)
   - Pronóstico marcado (1 para local gana, X para empate, 2 para visitante gana)
   - Predicción de goles para el Pleno al Quince (un número entre 0-10)

Por favor responde en formato JSON con esta estructura exacta:
{
  "partidos": [
    {
      "numero": 1,
      "equipo1": "Team A",
      "equipo2": "Team B",
      "prediction": "1",
      "pleonoPrediction": 2
    },
    ...
  ],
  "confidence": "high|medium|low",
  "rawText": "texto extraído del boleto"
}

IMPORTANTE:
- Si no puedes leer claramente algo, usa "confidence": "low"
- El pronóstico DEBE ser "1", "X" o "2"
- El Pleno al Quince es un número de goles
- Si faltan partidos, indica cuántos faltan en el rawText

Responde SOLO con el JSON, sin explicaciones adicionales.`

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo parsear respuesta JSON')
    }

    const result = JSON.parse(jsonMatch[0]) as ExtractedBoleto

    return result
  } catch (error) {
    console.error('Error reading boleto from base64:', error)
    throw new Error('Error al procesar imagen del boleto con IA')
  }
}
