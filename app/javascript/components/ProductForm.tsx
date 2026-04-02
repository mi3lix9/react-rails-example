import React from "react";

interface ProductFormProps {
  product: {
    id?: number;
    name: string;
  };
  action: string;
  method?: string;
  authenticityToken: string;
}

export default function ProductForm({
  product,
  action,
  method,
  authenticityToken,
}: ProductFormProps) {
  const isEdit = !!product.id;

  return (
    <div>
      <h1>{isEdit ? "Edit product" : "New product"}</h1>
      <form action={action} method="post" acceptCharset="UTF-8">
        <input type="hidden" name="authenticity_token" value={authenticityToken} />
        {method && <input type="hidden" name="_method" value={method} />}
        <div>
          <label htmlFor="product_name">Name</label>
          <input
            type="text"
            name="product[name]"
            id="product_name"
            defaultValue={product.name}
          />
        </div>
        <div>
          <input
            type="submit"
            value={isEdit ? "Update Product" : "Create Product"}
          />
        </div>
      </form>
      <a href="/products">Cancel</a>
    </div>
  );
}
