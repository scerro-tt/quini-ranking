import { auth } from '@/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { jornadaId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const prediction = await db.prediction.findFirst({
      where: {
        jornadaId: params.jornadaId,
        userId: session.user.id,
      },
      include: {
        partidoResults: { orderBy: { numero: 'asc' } },
      },
    })

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 })
    }

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
