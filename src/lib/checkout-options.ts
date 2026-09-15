import type { CartItem } from "@/models/product";

export interface CheckoutPaymentMethod {
  id: string;
  title: string;
  description: string;
}

export interface CheckoutShippingMethod {
  id: string;
  title: string;
  description: string;
  total: number;
}

export const COORDINATED_SHIPPING_METHODS: CheckoutShippingMethod[] = [
  {
    id: "fimy:correo-argentino-sucursal",
    title: "Correo Argentino — retiro en sucursal",
    description: "Costo a coordinar según destino.",
    total: 0,
  },
  {
    id: "fimy:correo-argentino-domicilio",
    title: "Correo Argentino — envío a domicilio",
    description: "Costo a coordinar según destino.",
    total: 0,
  },
  {
    id: "fimy:entrega-corrientes-capital",
    title: "Entrega en Corrientes Capital",
    description: "Costo y modalidad a coordinar.",
    total: 0,
  },
];

export function getShippingMethod(methodId: string) {
  return COORDINATED_SHIPPING_METHODS.find((method) => method.id === methodId);
}

const PAYMENT_METHOD_ORDER = [
  "woo-mercado-pago-basic",
  "woo-mercado-pago-custom",
  "cod",
  "bacs",
  "cheque",
  "woo-mercado-pago-credits",
];

export function sortPaymentMethods(methods: CheckoutPaymentMethod[]) {
  return [...methods].sort((a, b) => {
    const aIndex = PAYMENT_METHOD_ORDER.indexOf(a.id);
    const bIndex = PAYMENT_METHOD_ORDER.indexOf(b.id);
    return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
  });
}

export function getPaymentMethodCopy(method: CheckoutPaymentMethod) {
  switch (method.id) {
    case "woo-mercado-pago-basic":
      return {
        title: "Mercado Pago",
        description: "Pagá con los medios disponibles en tu cuenta.",
        benefit: "Hasta 3 cuotas sin interés.",
      };
    case "woo-mercado-pago-custom":
      return {
        title: "Tarjeta de crédito o débito",
        description: "Pago procesado de forma segura por Mercado Pago.",
        benefit: "Hasta 3 cuotas sin interés.",
      };
    case "woo-mercado-pago-credits":
      return {
        title: "Cuotas sin tarjeta con Mercado Pago",
        description: "Pagá en cuotas con una línea de crédito disponible en tu cuenta de Mercado Pago.",
      };
    case "bacs":
    case "cod":
    case "cheque":
      return {
        title: "Transferencia bancaria — 30% OFF",
        description: "El descuento se aplica automáticamente al total.",
      };
    default:
      return {
        title: method.title,
        description: method.description || "Elegí este medio para continuar.",
      };
  }
}

export function isTransferPaymentMethod(paymentMethodId: string, gatewayIds?: string[]) {
  if (!paymentMethodId) return false;
  if (gatewayIds?.length) return gatewayIds.includes(paymentMethodId);
  return ["bacs", "cod", "cheque"].includes(paymentMethodId);
}

export function getListUnitPrice(item: CartItem) {
  return item.product.prices?.list ?? item.product.prices?.base ?? item.product.price;
}

export function getListSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + getListUnitPrice(item) * item.quantity, 0);
}

export function getCheckoutUnitPrice(item: CartItem, paymentMethodId: string) {
  const prices = item.product.prices;
  if (isTransferPaymentMethod(paymentMethodId, prices?.discountGatewayIds) && prices?.discount) {
    return prices.discount;
  }
  return getListUnitPrice(item);
}
