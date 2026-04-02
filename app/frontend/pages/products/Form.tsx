import { useForm, Link } from "@inertiajs/react";
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

interface Props {
  product: {
    id?: number;
    name: string;
  };
}

export default function Form({ product }: Props) {
  const isEdit = !!product.id;
  const { data, setData, post, patch, processing } = useForm({
    name: product.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      patch(`/products/${product.id}`);
    } else {
      post("/products");
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
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                placeholder="Enter product name"
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={processing}>
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
