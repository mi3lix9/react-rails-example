import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  if (!product) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Product #{product.id}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild>
            <Link to={`/products/${product.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/products">Back to products</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
