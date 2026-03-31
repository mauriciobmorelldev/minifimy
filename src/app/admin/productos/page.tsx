import type { Metadata } from "next";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Admin productos",
  description: "Panel interno para gestionar productos MINIFIMY.",
};

export default function AdminProductsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-on-surface font-headline">
          Administración de productos
        </h1>
        <button className="btn-primary">Nuevo producto</button>
      </div>
      <p className="mt-3 text-sm text-on-surface-variant">
        Este panel es un placeholder. Aquí podrás editar stock, precios e imágenes cuando
        conectemos el CMS.
      </p>

      <div className="mt-8 overflow-hidden rounded-lg bg-surface-container-low shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Precio</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-outline-variant/30">
                <td className="px-4 py-3 font-semibold text-on-surface">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{product.category}</td>
                <td className="px-4 py-3 text-on-surface-variant">{product.stock}</td>
                <td className="px-4 py-3 text-on-surface">
                  AR$ {product.price.toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
