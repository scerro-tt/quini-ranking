import { auth } from '@/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const seasons = await db.season.findMany({
      include: {
        _count: { select: { jornadas: true } },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({ seasons })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
