import { Link, useForm } from "@inertiajs/react";
import Layout from "@/components/Layout";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCart } from "@/hooks/useCart";

export default function Index() {
  const { items, cartTotal, clearCart } = useCart();

  const form = useForm({
    customer_name: "",
    customer_email: "",
    items: items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
    })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.transform((data) => ({
      ...data,
      items: items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
      })),
    }));
    form.post("/orders", {
      onSuccess: () => clearCart(),
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 px-4 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Checkout</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Name</Label>
                <Input
                  type="text"
                  id="customer_name"
                  value={form.data.customer_name}
                  onChange={(e) => form.setData("customer_name", e.target.value)}
                  placeholder="Your full name"
                />
                {form.errors.customer_name && (
                  <p className="text-sm text-destructive">{form.errors.customer_name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  type="email"
                  id="customer_email"
                  value={form.data.customer_email}
                  onChange={(e) => form.setData("customer_email", e.target.value)}
                  placeholder="you@example.com"
                />
                {form.errors.customer_email && (
                  <p className="text-sm text-destructive">{form.errors.customer_email}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right w-16">Qty</TableHead>
                    <TableHead className="text-right w-24">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${cartTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? "Placing Order..." : "Place Order"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cart">Back to Cart</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

Index.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
