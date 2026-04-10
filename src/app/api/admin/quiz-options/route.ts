import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/quiz-options - Fetch all quiz options with collection name
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('quiz_options')
      .select(`
        *,
        collections ( id, name )
      `)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten collection name
    const options = data?.map((opt) => ({
      ...opt,
      collection_name: opt.collections?.name || null,
      collections: undefined,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching quiz options:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/quiz-options - Create new quiz option
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('quiz_options')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz option:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
