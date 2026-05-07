import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/session';
import type { PartnerRow, ContractRow } from '@/lib/db';
import type { Partner } from '@/types';

// GET /api/partners/[id] - Get single partner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const partners = await sql<PartnerRow[]>`
      SELECT * FROM partners WHERE id = ${id} LIMIT 1
    `;

    if (partners.length === 0) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const partner = partners[0];

    const contracts = await sql<ContractRow[]>`
      SELECT * FROM contracts WHERE partner_id = ${id} LIMIT 1
    `;

    const contract = contracts[0];

    const partnerData: Partner = {
      id: partner.id,
      name_en: partner.name_en,
      name_th: partner.name_th || undefined,
      category: partner.category as any,
      zone: partner.zone as any,
      lat: partner.lat,
      lng: partner.lng,
      strategic_note: partner.strategic_note || undefined,
      contract: contract
        ? {
            type: contract.type,
            status: contract.status as any,
            start_date: contract.start_date || undefined,
            end_date: contract.end_date || undefined,
            renewal_owner: contract.renewal_owner || undefined,
            value: contract.value || undefined,
          }
        : undefined,
    };

    return NextResponse.json({ partner: partnerData });
  } catch (error) {
    console.error('Get partner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/partners/[id] - Update partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole('manager');
    const { id } = await params;
    const body = await request.json();

    const {
      name_en,
      name_th,
      category,
      zone,
      lat,
      lng,
      strategic_note,
      contract,
    } = body;

    // Update partner
    const updatedPartners = await sql<PartnerRow[]>`
      UPDATE partners
      SET
        name_en = ${name_en},
        name_th = ${name_th || null},
        category = ${category},
        zone = ${zone},
        lat = ${lat},
        lng = ${lng},
        strategic_note = ${strategic_note || null},
        updated_by = ${user.id}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedPartners.length === 0) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const updatedPartner = updatedPartners[0];

    // Update or create contract
    let updatedContract = null;
    if (contract && contract.type) {
      // Check if contract exists
      const existingContracts = await sql<ContractRow[]>`
        SELECT * FROM contracts WHERE partner_id = ${id} LIMIT 1
      `;

      if (existingContracts.length > 0) {
        // Update existing contract
        const contracts = await sql<ContractRow[]>`
          UPDATE contracts
          SET
            type = ${contract.type},
            status = ${contract.status || 'prospect'},
            start_date = ${contract.start_date || null},
            end_date = ${contract.end_date || null},
            renewal_owner = ${contract.renewal_owner || null},
            value = ${contract.value || null}
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
            ${contract.status || 'prospect'},
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

    // Log activity
    await sql`
      INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
      VALUES (
        ${user.id},
        'UPDATE',
        'partner',
        ${id},
        ${JSON.stringify({ name_en, category })}
      )
    `;

    const partner: Partner = {
      id: updatedPartner.id,
      name_en: updatedPartner.name_en,
      name_th: updatedPartner.name_th || undefined,
      category: updatedPartner.category as any,
      zone: updatedPartner.zone as any,
      lat: updatedPartner.lat,
      lng: updatedPartner.lng,
      strategic_note: updatedPartner.strategic_note || undefined,
      contract: updatedContract
        ? {
            type: updatedContract.type,
            status: updatedContract.status as any,
            start_date: updatedContract.start_date || undefined,
            end_date: updatedContract.end_date || undefined,
            renewal_owner: updatedContract.renewal_owner || undefined,
            value: updatedContract.value || undefined,
          }
        : undefined,
    };

    return NextResponse.json({ partner });
  } catch (error: any) {
    console.error('Update partner error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/[id] - Delete partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole('admin'); // Only admins can delete
    const { id } = await params;

    // Delete partner (contract will be deleted by CASCADE)
    const deletedPartners = await sql<PartnerRow[]>`
      DELETE FROM partners WHERE id = ${id} RETURNING *
    `;

    if (deletedPartners.length === 0) {
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
        'DELETE',
        'partner',
        ${id},
        ${JSON.stringify({ name_en: deletedPartners[0].name_en })}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete partner error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
