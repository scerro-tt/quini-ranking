import { auth } from '@/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { seasonId: string } }
) {
  try {
    const session = await auth()
    console.log('API Route Session:', JSON.stringify(session, null, 2))

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { weekNumber, matchDate } = await request.json()

    const season = await db.season.findUnique({
      where: { id: params.seasonId },
    })

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 })
    }

    const existing = await db.jornada.findUnique({
      where: { seasonId_weekNumber: { seasonId: params.seasonId, weekNumber } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Week already exists in this season' }, { status: 400 })
    }

    const jornada = await db.jornada.create({
      data: {
        seasonId: params.seasonId,
        userId: session.user.id,
        weekNumber,
        matchDate: new Date(matchDate),
      },
    })

    return NextResponse.json({ success: true, jornada })
  } catch (error) {
    console.error('Error creating jornada:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
