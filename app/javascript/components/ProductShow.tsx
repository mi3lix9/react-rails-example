import React from "react";

interface ProductShowProps {
  product: {
    id: number;
    name: string;
  };
}

export default function ProductShow({ product }: ProductShowProps) {
  return (
    <div>
      <h1>{product.name}</h1>
      <a href="/products">Back to products</a>
    </div>
  );
}
