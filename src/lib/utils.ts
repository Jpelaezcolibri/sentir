export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getProductWhatsAppMessage(productName: string, collectionName: string, selectedSize?: string | null): string {
  if (selectedSize) {
    return `Hola! Me interesó "${productName}" de la colección ${collectionName}. Quiero talla ${selectedSize}. ¿Qué colores tienen disponibles?`;
  }
  return `Hola! Me interesó "${productName}" de la colección ${collectionName}. Quiero saber disponibilidad de tallas y colores.`;
}

const EMOJI_SIREN = '\uD83D\uDEA8';
const EMOJI_LIGHTNING = '\u26A1';
const EMOJI_PERSON = '\uD83D\uDC64';
const EMOJI_GIFT = '\uD83C\uDF81';

function cleanColorForDisplay(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const trimmed = color.trim();
  if (trimmed.includes('[') || trimmed.includes('"') || trimmed.includes('\\')) {
    return 'Segun disponibilidad';
  }
  return trimmed;
}

export interface CartItemForMessage {
  name: string;
  size: string;
  color?: string;
  quantity: number;
  price: number;
  isEntregaInmediata?: boolean;
  isAddon?: boolean;
}

export function getCartWhatsAppMessage(
  items: CartItemForMessage[],
  total: number,
  orderUrl?: string,
  customerName?: string
): string {
  const productItems = items.filter((item) => !item.isAddon);
  const addonItems = items.filter((item) => item.isAddon);
  const hasEntregaInmediata = productItems.some((item) => item.isEntregaInmediata);

  const lines = productItems.map((item, i) => {
    const colorDisplay = cleanColorForDisplay(item.color);
    return `${i + 1}. ${item.isEntregaInmediata ? EMOJI_LIGHTNING + ' ' : ''}${item.name} - Talla ${item.size}${colorDisplay ? ` - Color ${colorDisplay}` : ''} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`;
  });

  let msg = '';

  if (hasEntregaInmediata) {
    msg += `${EMOJI_SIREN}${EMOJI_SIREN} *PEDIDO CON ENTREGA INMEDIATA* ${EMOJI_SIREN}${EMOJI_SIREN}\n${EMOJI_LIGHTNING} Este pedido incluye productos de ENVIO HOY\n\n`;
  }

  msg += `Hola! Quiero hacer este pedido:`;
  if (customerName) {
    msg += `\n\n${EMOJI_PERSON} *Nombre:* ${customerName}`;
  }
  msg += `\n\n${lines.join('\n')}`;

  if (addonItems.length > 0) {
    msg += `\n\n${EMOJI_GIFT} *Complementos:*`;
    addonItems.forEach((addon) => {
      msg += `\n- ${addon.name} - ${formatPrice(addon.price)}`;
    });
  }

  msg += `\n\nTOTAL: ${formatPrice(total)}`;
  if (orderUrl) {
    msg += `\n\nVer pedido completo:\n${orderUrl}`;
  }
  msg += `\n\nQuedo atento/a a la confirmacion!`;

  return msg;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function safeScrollIntoView(
  element: HTMLElement | null,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "center" }
) {
  if (!element) return;
  try {
    element.scrollIntoView(options);
  } catch {
    element.scrollIntoView();
  }
}

export async function safeClipboardWrite(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement("input");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.focus();
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
}
