export interface ProductPriceSet {
  base: number;
  list?: number;
  discount?: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  image?: string;
  price?: number;
  prices?: ProductPriceSet;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  prices?: ProductPriceSet;
  images: string[];
  category: string;
  categoryId?: string;
  categorySlugs?: string[];
  categoryIds?: string[];
  stock: number;
  badge?: string;
  sizes?: string[];
  colors?: string[];
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
  variationId?: string;
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
