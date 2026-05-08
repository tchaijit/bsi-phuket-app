import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/session';
import type { PartnerRow, ContractRow } from '@/lib/db';
import type { Partner } from '@/types';

// PUT /api/partners/[id] - Update entire partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireRole('manager');
    const body = await request.json();

    const {
      name_en,
      name_th,
      partner_type,
      category,
      zone,
      lat,
      lng,
      strategic_note,
      contract,
    } = body;

    // Update partner - use individual params to avoid SQL injection
    const updated = await sql<PartnerRow[]>`
      UPDATE partners
      SET
        name_en = ${name_en},
        name_th = ${name_th || null},
        partner_type = ${partner_type || 'partner'},
        category = ${category},
        zone = ${zone},
        lat = ${lat},
        lng = ${lng},
        strategic_note = ${strategic_note || null},
        updated_by = ${user.id},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Update or create contract if provided
    let updatedContract: ContractRow | undefined;
    if (contract) {
      // Check if contract exists
      const existing = await sql<ContractRow[]>`
        SELECT * FROM contracts WHERE partner_id = ${id}
      `;

      if (existing.length > 0) {
        // Update existing contract
        const contracts = await sql<ContractRow[]>`
          UPDATE contracts
          SET
            type = ${contract.type},
            status = ${contract.status},
            start_date = ${contract.start_date || null},
            end_date = ${contract.end_date || null},
            renewal_owner = ${contract.renewal_owner || null},
            value = ${contract.value || null},
            updated_at = CURRENT_TIMESTAMP
          WHERE partner_id = ${id}
          RETURNING *
        `;
        updatedContract = contracts[0];
      } else {
        // Create new contract
        const contracts = await sql<ContractRow[]>`
          INSERT INTO contracts (
            partner_id, type, status, start_date, end_date, renewal_owner, value
          )
          VALUES (
            ${id},
            ${contract.type},
            ${contract.status},
            ${contract.start_date || null},
            ${contract.end_date || null},
            ${contract.renewal_owner || null},
            ${contract.value || null}
          )
          RETURNING *
        `;
        updatedContract = contracts[0];
      }
    }

    const updatedPartner = updated[0];
    const partner: Partner = {
      id: updatedPartner.id,
      name_en: updatedPartner.name_en,
      name_th: updatedPartner.name_th || undefined,
      partner_type: (updatedPartner.partner_type as any) || 'partner',
      category: updatedPartner.category as any,
      zone: updatedPartner.zone as any,
      lat: typeof updatedPartner.lat === 'string' ? parseFloat(updatedPartner.lat) : updatedPartner.lat,
      lng: typeof updatedPartner.lng === 'string' ? parseFloat(updatedPartner.lng) : updatedPartner.lng,
      strategic_note: updatedPartner.strategic_note || undefined,
      contract: updatedContract
        ? {
            type: updatedContract.type,
            status: updatedContract.status as any,
            start_date: updatedContract.start_date || undefined,
            end_date: updatedContract.end_date || undefined,
            renewal_owner: updatedContract.renewal_owner || undefined,
            value: updatedContract.value
              ? (typeof updatedContract.value === 'string' ? parseFloat(updatedContract.value) : updatedContract.value)
              : undefined,
          }
        : undefined,
    };

    return NextResponse.json({ partner });
  } catch (error: any) {
    console.error('Update partner error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
    });

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error.detail },
      { status: 500 }
    );
  }
}

// PATCH /api/partners/[id] - Update partner location
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      WHERE id = ${id}
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
        ${id},
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
