import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { items, total, customerName } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    const baseUrl = request.headers.get('origin') || 'https://sentir-nine.vercel.app';
    const productItems = items.filter((i: any) => !i.isAddon);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vista Previa del Pedido</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 24px; }
    .customer { background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .customer strong { display: block; margin-bottom: 4px; }
    .products { margin-bottom: 24px; }
    .product { display: flex; gap: 12px; padding: 12px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 12px; }
    .product-image { width: 80px; height: 80px; background: #f0f0f0; border-radius: 6px; flex-shrink: 0; overflow: hidden; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .product-info { flex: 1; min-width: 0; }
    .product-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #333; }
    .product-details { font-size: 12px; color: #666; margin-bottom: 6px; }
    .product-price { font-weight: 600; color: #667eea; font-size: 14px; }
    .product-link { display: inline-block; margin-top: 6px; padding: 6px 10px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; }
    .summary { background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .summary-row:last-child { margin-bottom: 0; font-weight: 600; font-size: 16px; color: #667eea; }
    .footer { text-align: center; padding: 16px; background: #f9f9f9; font-size: 12px; color: #999; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Tu Pedido SENTIR</h1>
      <p>Haz clic en "Ver Producto" para ver fotos y detalles</p>
    </div>
    <div class="content">
      ${customerName ? `<div class="customer"><strong>👤 ${customerName}</strong></div>` : ''}

      <div class="products">
        ${productItems.map((item: any, i: number) => `
          <div class="product">
            <div class="product-image">
              ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div style="width:100%;height:100%;background:#eee;"></div>'}
            </div>
            <div class="product-info">
              <div class="product-name">${i + 1}. ${item.name}</div>
              <div class="product-details">
                ${item.size ? `Talla: ${item.size} • ` : ''}Cantidad: ${item.quantity}
              </div>
              <div class="product-price">$${(item.price * item.quantity).toLocaleString('es-CO')}</div>
              ${item.productId ? `<a href="${baseUrl}/producto/${item.productId}" class="product-link">🔗 Ver Producto</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="summary">
        <div class="summary-row">
          <span>${productItems.length} Producto${productItems.length !== 1 ? 's' : ''}</span>
          <span>$${productItems.reduce((s: number, i: any) => s + (i.price * i.quantity), 0).toLocaleString('es-CO')}</span>
        </div>
        <div class="summary-row">
          <span>TOTAL</span>
          <span>$${total.toLocaleString('es-CO')}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Comparte este enlace con tu asesor de SENTIR para confirmar tu pedido 💬</p>
    </div>
  </div>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
