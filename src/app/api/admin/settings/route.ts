import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/settings - Fetch all site settings as key-value object
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert rows to key-value object
    const settings: Record<string, string> = {};
    data?.forEach((row) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Upsert settings from key-value pairs
export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // body is an object with key-value pairs, e.g. { "site_name": "SENTIR", "whatsapp": "+57..." }
    const entries = Object.entries(body);

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron configuraciones' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const upsertData = entries.map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: now,
    }));

    const { error } = await supabase
      .from('site_settings')
      .upsert(upsertData, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the updated settings as key-value object
    const { data: updatedData, error: fetchError } = await supabase
      .from('site_settings')
      .select('*');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const settings: Record<string, string> = {};
    updatedData?.forEach((row) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
