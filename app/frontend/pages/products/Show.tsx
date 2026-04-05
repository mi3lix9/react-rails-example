import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
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
  };
}

export default function Show({ product }: Props) {
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
            <Link href={`/products/${product.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Back to products</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
