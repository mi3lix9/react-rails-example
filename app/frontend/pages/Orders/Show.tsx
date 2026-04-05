import { Link } from "@inertiajs/react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
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

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  token: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

interface Props {
  order: Order;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function Show({ order }: Props) {
  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Order Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">{STATUS_LABELS[order.status]}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Customer</p>
            <p>{order.customer_name} ({order.customer_email})</p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Placed</p>
            <p>{new Date(order.created_at).toLocaleDateString()}</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right w-16">Qty</TableHead>
                <TableHead className="text-right w-24">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">
                  ${order.total.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Bookmark this page to check your order status. Your order URL:{" "}
            <code className="text-foreground">/orders/{order.token}</code>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

Show.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
