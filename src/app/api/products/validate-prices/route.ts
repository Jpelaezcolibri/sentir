import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const productIds = items.map((item: { productId: string }) => item.productId).filter(Boolean);

    if (productIds.length === 0) {
      return NextResponse.json({ validatedItems: items }, { status: 200 });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const priceMap = new Map(products?.map((p: { id: string; price: number }) => [p.id, p.price]) || []);

    const validatedItems = items.map((item: { productId: string; price: number; [key: string]: any }) => {
      const currentPrice = priceMap.get(item.productId);
      const priceChanged = currentPrice !== undefined && currentPrice !== item.price;

      return {
        ...item,
        originalCartPrice: item.price,
        currentPrice: currentPrice || item.price,
        priceChanged,
      };
    });

    return NextResponse.json({
      validatedItems,
      hasChanges: validatedItems.some((item: { priceChanged: boolean }) => item.priceChanged),
    }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
