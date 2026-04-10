import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function generateOrderId(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function POST(request: NextRequest) {
  try {
    const { items, total, totalItems, customerName } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No hay productos en el pedido' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const orderId = generateOrderId();
    const orderData: Record<string, unknown> = { id: orderId, items, total, total_items: totalItems, status: 'pending' };
    if (customerName?.trim()) orderData.customer_name = customerName.trim();
    const { error } = await supabase.from('orders').insert(orderData);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: orderId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
