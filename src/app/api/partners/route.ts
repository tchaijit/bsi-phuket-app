import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth, getCurrentUser, requireRole } from '@/lib/session';
import type { PartnerRow, ContractRow } from '@/lib/db';
import type { Partner } from '@/types';

// GET /api/partners - Get all partners with contracts
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get all partners with their contracts
    const partners = await sql<PartnerRow[]>`
      SELECT * FROM partners ORDER BY created_at DESC
    `;

    const contracts = await sql<ContractRow[]>`
      SELECT * FROM contracts
    `;

    // Map contracts to partners
    const partnersWithContracts: Partner[] = partners.map((p) => {
      const contract = contracts.find((c) => c.partner_id === p.id);

      return {
        id: p.id,
        name_en: p.name_en,
        name_th: p.name_th || undefined,
        category: p.category as any,
        zone: p.zone as any,
        lat: typeof p.lat === 'string' ? parseFloat(p.lat) : p.lat,
        lng: typeof p.lng === 'string' ? parseFloat(p.lng) : p.lng,
        strategic_note: p.strategic_note || undefined,
        contract: contract
          ? {
              type: contract.type,
              status: contract.status as any,
              start_date: contract.start_date || undefined,
              end_date: contract.end_date || undefined,
              renewal_owner: contract.renewal_owner || undefined,
              value: typeof contract.value === 'string' ? parseFloat(contract.value) : contract.value,
            }
          : undefined,
      };
    });

    return NextResponse.json({ partners: partnersWithContracts });
  } catch (error) {
    console.error('Get partners error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/partners - Create new partner
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('manager');
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

    // Validate required fields
    if (!name_en || !category || !zone || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert partner
    const newPartners = await sql<PartnerRow[]>`
      INSERT INTO partners (
        name_en, name_th, category, zone, lat, lng, strategic_note, created_by
      )
      VALUES (
        ${name_en},
        ${name_th || null},
        ${category},
        ${zone},
        ${lat},
        ${lng},
        ${strategic_note || null},
        ${user.id}
      )
      RETURNING *
    `;

    const newPartner = newPartners[0];

    // Insert contract if provided
    let newContract = null;
    if (contract && contract.type) {
      const contracts = await sql<ContractRow[]>`
        INSERT INTO contracts (
          partner_id, type, status, start_date, end_date, renewal_owner, value
        )
        VALUES (
          ${newPartner.id},
          ${contract.type},
          ${contract.status || 'prospect'},
          ${contract.start_date || null},
          ${contract.end_date || null},
          ${contract.renewal_owner || null},
          ${contract.value || null}
        )
        RETURNING *
      `;
      newContract = contracts[0];
    }

    // Log activity
    await sql`
      INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
      VALUES (
        ${user.id},
        'CREATE',
        'partner',
        ${newPartner.id},
        ${JSON.stringify({ name_en, category })}
      )
    `;

    const partner: Partner = {
      id: newPartner.id,
      name_en: newPartner.name_en,
      name_th: newPartner.name_th || undefined,
      category: newPartner.category as any,
      zone: newPartner.zone as any,
      lat: newPartner.lat,
      lng: newPartner.lng,
      strategic_note: newPartner.strategic_note || undefined,
      contract: newContract
        ? {
            type: newContract.type,
            status: newContract.status as any,
            start_date: newContract.start_date || undefined,
            end_date: newContract.end_date || undefined,
            renewal_owner: newContract.renewal_owner || undefined,
            value: newContract.value || undefined,
          }
        : undefined,
    };

    return NextResponse.json({ partner }, { status: 201 });
  } catch (error: any) {
    console.error('Create partner error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
