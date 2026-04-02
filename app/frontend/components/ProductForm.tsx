import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [name, setName] = useState("");

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((product) => setName(product.name));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEdit ? `/api/products/${id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: { name } }),
    });

    if (res.ok) {
      const product = await res.json();
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div>
      <h1>{isEdit ? "Edit product" : "New product"}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="product_name">Name</label>
          <input
            type="text"
            id="product_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <button type="submit">
            {isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
      <Link to="/products">Cancel</Link>
    </div>
  );
}
