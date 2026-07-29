function value(name: string) {
  return process.env[name]?.trim() || undefined;
}

export const storePolicy = {
  shipping: {
    approved: process.env.STORE_SHIPPING_POLICY_APPROVED === "true",
    origin: value("STORE_SHIPPING_ORIGIN"),
    carriers: value("STORE_SHIPPING_CARRIERS"),
    coverage: value("STORE_SHIPPING_COVERAGE"),
    cost: value("STORE_SHIPPING_COST"),
    timing: value("STORE_SHIPPING_TIMING"),
    tracking: value("STORE_SHIPPING_TRACKING"),
  },
  exchanges: {
    approved: process.env.STORE_EXCHANGE_POLICY_APPROVED === "true",
    window: value("STORE_EXCHANGE_WINDOW"),
    conditions: value("STORE_EXCHANGE_CONDITIONS"),
    exclusions: value("STORE_EXCHANGE_EXCLUSIONS"),
    cost: value("STORE_EXCHANGE_COST"),
  },
  sizing: {
    approved: process.env.STORE_SIZE_GUIDE_APPROVED === "true",
    measurements: value("STORE_SIZE_GUIDE_MEASUREMENTS"),
    instructions: value("STORE_SIZE_GUIDE_INSTRUCTIONS"),
  },
};

export function hasApprovedShippingPolicy() {
  return storePolicy.shipping.approved &&
    Boolean(storePolicy.shipping.origin && storePolicy.shipping.coverage && storePolicy.shipping.cost);
}

export function hasApprovedExchangePolicy() {
  return storePolicy.exchanges.approved &&
    Boolean(storePolicy.exchanges.window && storePolicy.exchanges.conditions);
}

export function hasApprovedSizeGuide() {
  return storePolicy.sizing.approved && Boolean(storePolicy.sizing.measurements);
}
