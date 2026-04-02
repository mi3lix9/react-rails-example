import React from "react";

interface Product {
  id: number;
  name: string;
}

interface ProductIndexProps {
  products: Product[];
}

export default function ProductIndex({ products }: ProductIndexProps) {
  return (
    <div>
      <h1>Products</h1>
      <a href="/products/new">New product</a>
      <div id="products">
        {products.map((product) => (
          <div key={product.id}>
            <a href={`/products/${product.id}`}>{product.name}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
