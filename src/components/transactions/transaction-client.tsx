"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Eye, Receipt, Calendar, Printer, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";

type Transaction = {
  id: string;
  created_at: string;
  total_price: number;
  payment: number;
  change_amount: number;
  users: {
    name: string;
  } | null;
  transaction_items: {
    quantity: number;
    price: number;
    subtotal: number;
    products: {
      name: string;
    } | null;
  }[];
};

export default function TransactionClient({ data }: { data: Transaction[] }) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [printingTransaction, setPrintingTransaction] =
    useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    if (printingTransaction) {
      window.print();
      setPrintingTransaction(null);
    }
  }, [printingTransaction]);

  const filteredData = dateFilter
    ? data.filter((t) => t.created_at.startsWith(dateFilter))
    : data;

  const totalRevenue = filteredData.reduce((sum, t) => sum + t.total_price, 0);
  const totalTransactions = filteredData.length;

  const handleQuickPrint = (transaction: Transaction) => {
    setPrintingTransaction(transaction);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola dan cetak ulang struk transaksi Frendo POS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalTransactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <Button
                variant="ghost"
                onClick={() => setDateFilter("")}
                className="text-destructive"
              >
                <X className="h-4 w-4 mr-1" /> Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-lg bg-white print:hidden">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-muted/20">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada transaksi</h3>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tanggal & Waktu</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Total Harga</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs uppercase text-muted-foreground">
                    #{transaction.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(transaction.created_at).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {transaction.users?.name || "System"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.transaction_items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}{" "}
                    qty
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(transaction.total_price)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Detail
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleQuickPrint(transaction)}
                    >
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div
        id="receipt-print-area"
        className="hidden print:block text-[12px] leading-tight font-mono text-black w-[80mm] p-2 mx-auto"
      >
        {(printingTransaction || selectedTransaction) && (
          <>
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-lg font-bold uppercase">Frendo POS</h2>
              <p>Jl. Baru No. 123</p>
              <p>WA: 0812-3456-7890</p>
              <p>================================</p>
            </div>

            <div className="space-y-1 mb-2 uppercase">
              <p>
                Tgl :{" "}
                {new Date(
                  (printingTransaction || selectedTransaction)!.created_at
                ).toLocaleString("id-ID")}
              </p>
              <p>
                ID : #
                {(printingTransaction || selectedTransaction)!.id.slice(0, 8)}
              </p>
              <p>
                Ksr :{" "}
                {(printingTransaction || selectedTransaction)!.users?.name}
              </p>
              <p>--------------------------------</p>
            </div>

            <div className="space-y-2 mb-2">
              {(printingTransaction ||
                selectedTransaction)!.transaction_items.map((item, idx) => (
                <div key={idx}>
                  <p className="uppercase">{item.products?.name}</p>
                  <div className="flex justify-between">
                    <span>
                      {item.quantity} x {item.price.toLocaleString()}
                    </span>
                    <span>{item.subtotal.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-t border-dashed pt-2">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>
                  {formatCurrency(
                    (printingTransaction || selectedTransaction)!.total_price
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>BAYAR</span>
                <span>
                  {formatCurrency(
                    (printingTransaction || selectedTransaction)!.payment
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>KEMBALI</span>
                <span>
                  {formatCurrency(
                    (printingTransaction || selectedTransaction)!.change_amount
                  )}
                </span>
              </div>
            </div>

            <div className="text-center mt-6 uppercase">
              <p>Terima Kasih</p>
              <p>Barang yang sudah dibeli</p>
              <p>tidak dapat ditukar/dikembalikan</p>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-md print:hidden">
          <DialogHeader>
            <div className="flex justify-between items-center pr-6">
              <DialogTitle>Detail Transaksi</DialogTitle>
              <Button onClick={() => window.print()} size="sm">
                <Printer className="h-4 w-4 mr-2" /> Cetak
              </Button>
            </div>
            <DialogDescription>ID: {selectedTransaction?.id}</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm border-b pb-4">
                <span className="text-muted-foreground">Kasir:</span>
                <span className="text-right font-medium">
                  {selectedTransaction.users?.name}
                </span>
              </div>
              <div className="space-y-3">
                {selectedTransaction.transaction_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.products?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(selectedTransaction.total_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bayar (Tunai)</span>
                  <span>{formatCurrency(selectedTransaction.payment)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>Kembalian</span>
                  <span>
                    {formatCurrency(selectedTransaction.change_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            display: block !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
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
