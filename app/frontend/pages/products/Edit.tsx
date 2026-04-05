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
    id: number;
    name: string;
    price: number;
  };
}

export default function Edit({ product }: Props) {
  const form = useForm({ name: product.name, price: String(product.price) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.patch(`/products/${product.id}`);
  };

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product_name">Name</Label>
              <Input
                type="text"
                id="product_name"
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                placeholder="Enter product name"
              />
              {form.errors.name && (
                <p className="text-sm text-destructive">{form.errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product_price">Price</Label>
              <Input
                type="number"
                id="product_price"
                step="0.01"
                min="0"
                value={form.data.price}
                onChange={(e) => form.setData("price", e.target.value)}
                placeholder="0.00"
              />
              {form.errors.price && (
                <p className="text-sm text-destructive">{form.errors.price}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? "Updating..." : "Update Product"}
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
