import { auth } from '@/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { jornadaId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { totalAmount, numWinners } = await request.json()

    if (!totalAmount || !numWinners) {
      return NextResponse.json(
        { error: 'totalAmount and numWinners required' },
        { status: 400 }
      )
    }

    // Calcular U (premio del 10)
    const U = totalAmount / numWinners

    // Actualizar Jornada con prizeU
    const jornada = await db.jornada.update({
      where: { id: params.jornadaId },
      data: { prizeU: U },
    })

    return NextResponse.json({ success: true, jornada })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
