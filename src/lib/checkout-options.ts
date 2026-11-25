import type { CartItem } from "@/models/product";
import { BLACK_FRIDAY_DISCOUNT, BLACK_FRIDAY_INSTALLMENTS, getBlackFridayPrice } from "@/lib/black-friday";

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

export const MERCADO_PAGO_CUSTOM_METHOD = "woo-mercado-pago-custom";

const PAYMENT_METHOD_ORDER = [
  "woo-mercado-pago-basic",
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

export function getPaymentMethodCopy(method: CheckoutPaymentMethod, campaign = false) {
  switch (method.id) {
    case "woo-mercado-pago-basic":
      return {
        title: "Mercado Pago",
        description: "Pagá con tarjeta de crédito, débito u otros medios en Mercado Pago.",
        benefit: `Hasta ${campaign ? BLACK_FRIDAY_INSTALLMENTS : 3} cuotas sin interés con tarjetas elegibles.`,
      };
    case "woo-mercado-pago-credits":
      return {
        title: "Pagos sin Tarjeta de Mercado Pago",
        description: "Pagá en cuotas sin tarjeta usando tu línea de crédito disponible en Mercado Pago.",
      };
    case "bacs":
    case "cod":
    case "cheque":
      return {
        title: `Transferencia bancaria — ${campaign ? BLACK_FRIDAY_DISCOUNT : 30}% OFF`,
        description: "El descuento se aplica automáticamente al precio de los productos.",
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

export function getCartItemOptions(item: CartItem) {
  const singleOption = (values?: string[]) => values?.length === 1 ? values[0] : undefined;

  return {
    size: item.selection?.size ?? singleOption(item.product.sizes),
    color: item.selection?.color ?? singleOption(item.product.colors),
    model: item.selection?.model ?? singleOption(item.product.models),
  };
}

export function getListUnitPrice(item: CartItem) {
  return item.product.prices?.list ?? item.product.prices?.base ?? item.product.price;
}

export function getListSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + getListUnitPrice(item) * item.quantity, 0);
}

export function getCheckoutUnitPrice(item: CartItem, paymentMethodId: string, campaign = false) {
  const prices = item.product.prices;
  if (campaign) {
    const campaignPrice = getBlackFridayPrice(item.product.price, prices);
    return isTransferPaymentMethod(paymentMethodId) && campaignPrice ? campaignPrice.final : getListUnitPrice(item);
  }
  if (isTransferPaymentMethod(paymentMethodId, prices?.discountGatewayIds) && prices?.discount) {
    return prices.discount;
  }
  return getListUnitPrice(item);
}
