export interface ProductPriceSet {
  base: number;
  list?: number;
  discount?: number;
  discountGatewayIds?: string[];
  discountLabel?: string;
  listLabel?: string;
}

export type ProductStockStatus = "instock" | "outofstock" | "onbackorder" | string;

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  model?: string;
  variationAttributes?: { attribute: string; value: string }[];
  image?: string;
  price?: number;
  prices?: ProductPriceSet;
  stock?: number;
  stockStatus?: ProductStockStatus;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  material?: string;
  care?: string;
  fit?: string;
  includes?: string;
  price: number;
  prices?: ProductPriceSet;
  type?: "simple" | "variable" | "grouped" | "external" | string;
  featured?: boolean;
  dateCreated?: string;
  images: string[];
  category: string;
  categoryId?: string;
  categorySlugs?: string[];
  categoryIds?: string[];
  stock: number;
  stockStatus?: ProductStockStatus;
  badge?: string;
  tagSlugs?: string[];
  tagNames?: string[];
  sizes?: string[];
  colors?: string[];
  models?: string[];
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ProductFilterOptions {
  categories: Category[];
  sizes: string[];
  colors: string[];
  price: {
    min: number;
    max: number;
  };
}

export interface ProductSelection {
  size?: string;
  color?: string;
  model?: string;
  variationId?: string;
  variationAttributes?: { attribute: string; value: string }[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selection?: ProductSelection;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
}
