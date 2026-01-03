"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import { Search, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Badge } from "../ui/badge";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  discount_id: string | null;
  discounts: {
    type: string;
    value: number;
  } | null;
};

type CartItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  stock: number;
};

export default function CreateTransaction({
  products,
  userId,
}: {
  products: Product[];
  userId: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.stock > 0
  );

  const calculatePrice = (product: Product) => {
    if (!product.discounts) return product.price;

    if (product.discounts.type === "percent") {
      return product.price - (product.price * product.discounts.value) / 100;
    }
    return product.price - product.discounts.value;
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);
    const finalPrice = calculatePrice(product);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("Stok tidak mencukupi");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * finalPrice,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          price: finalPrice,
          subtotal: finalPrice,
          stock: product.stock,
        },
      ]);
    }
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          if (newQuantity > item.stock) {
            toast.error("Stok tidak mencukupi");
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const changeAmount = payment - totalPrice;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }

    if (payment < totalPrice) {
      toast.error("Pembayaran kurang");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: userId,
            total_price: totalPrice,
            payment: payment,
            change_amount: changeAmount,
          },
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      const transactionItems = cart.map((item) => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      for (const item of cart) {
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: item.stock - item.quantity })
          .eq("id", item.product_id);

        if (stockError) throw stockError;
      }

      toast.success("Transaksi berhasil!");
      router.push("/dashboard/transactions");
      router.refresh();
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Gagal membuat transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buat Transaksi Baru</h1>
        <p className="text-muted-foreground">
          Pilih produk dan masukkan jumlah pembayaran
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product) => {
                  const finalPrice = calculatePrice(product);
                  const hasDiscount =
                    product.discounts && finalPrice !== product.price;

                  return (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold mb-2 line-clamp-2">
                          {product.name}
                        </p>
                        <div className="space-y-1">
                          {hasDiscount ? (
                            <>
                              <p className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.price)}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(finalPrice)}
                              </p>
                            </>
                          ) : (
                            <p className="text-lg font-bold">
                              {formatCurrency(finalPrice)}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={product.stock > 10 ? "default" : "secondary"}
                          className="mt-2"
                        >
                          Stok: {product.stock}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keranjang masih kosong
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="border-b pb-3 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">
                            {item.product_name}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.product_id, -1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment">Pembayaran</Label>
                      <Input
                        id="payment"
                        type="number"
                        placeholder="0"
                        value={payment || ""}
                        onChange={(e) => setPayment(Number(e.target.value))}
                      />
                    </div>

                    {payment > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Kembalian:
                        </span>
                        <span
                          className={`font-semibold ${
                            changeAmount < 0
                              ? "text-destructive"
                              : "text-green-600"
                          }`}
                        >
                          {formatCurrency(Math.max(0, changeAmount))}
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        cart.length === 0 ||
                        payment < totalPrice
                      }
                    >
                      {isSubmitting ? "Memproses..." : "Bayar"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
