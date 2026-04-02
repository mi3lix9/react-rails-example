import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";

interface Product {
  id: number;
  name: string;
}

export default function ProductShow() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <Link to={`/products/${product.id}/edit`}>Edit</Link>
      {" | "}
      <Link to="/products">Back to products</Link>
    </div>
  );
}
