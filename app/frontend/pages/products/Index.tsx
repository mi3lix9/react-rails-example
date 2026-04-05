import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: number;
  name: string;
}

interface Props {
  products: Product[];
}

export default function Index({ products }: Props) {
  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/products/new">New product</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-36 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link href={`/products/${product.id}`} className="hover:underline">
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/products/${product.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm("Are you sure?")) {
                      router.delete(`/products/${product.id}`);
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
