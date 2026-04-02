import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEdit ? "Edit product" : "New product"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="product_name">Name</Label>
              <Input
                type="text"
                id="product_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit">
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/products">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
