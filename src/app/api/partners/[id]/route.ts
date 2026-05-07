import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/session';
import type { PartnerRow } from '@/lib/db';

// PATCH /api/partners/[id] - Update partner location
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('manager');
    const body = await request.json();
    const { lat, lng } = body;

    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Update partner location
    const updated = await sql<PartnerRow[]>`
      UPDATE partners
      SET lat = ${lat}, lng = ${lng}, updated_by = ${user.id}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Log activity
    await sql`
      INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
      VALUES (
        ${user.id},
        'UPDATE',
        'partner',
        ${params.id},
        ${JSON.stringify({ lat, lng })}
      )
    `;

    return NextResponse.json({ success: true, partner: updated[0] });
  } catch (error: any) {
    console.error('Update partner location error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
