import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// GET /api/admin/collections - Fetch all collections with product count
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch collections ordered by sort_order
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get product counts per collection
    const { data: productCounts, error: countError } = await supabase
      .from('products')
      .select('collection_id')
      .eq('is_active', true);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Build count map
    const countMap: Record<string, number> = {};
    productCounts?.forEach((p) => {
      countMap[p.collection_id] = (countMap[p.collection_id] || 0) + 1;
    });

    // Attach product_count to each collection
    const collectionsWithCount = collections?.map((c) => ({
      ...c,
      product_count: countMap[c.id] || 0,
    }));

    return NextResponse.json(collectionsWithCount);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/collections - Create a new collection
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Ensure the collection has an id
    if (!body.id) {
      body.id = crypto.randomUUID();
    }

    const { data, error } = await supabase
      .from('collections')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
