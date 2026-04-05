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

export default function New() {
  const form = useForm({ name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post("/products");
  };

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
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
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? "Creating..." : "Create Product"}
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
