export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  categoryId?: string;
  stock: number;
  badge?: string;
  sizes?: string[];
  colors?: string[];
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
