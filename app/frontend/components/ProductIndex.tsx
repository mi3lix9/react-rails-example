import React, { useEffect, useState } from "react";
import { Link } from "react-router";

interface Product {
  id: number;
  name: string;
}

export default function ProductIndex() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <Link to="/products/new">New product</Link>
      <div>
        {products.map((product) => (
          <div key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
