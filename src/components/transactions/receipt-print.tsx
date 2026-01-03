"use client";

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

export default function ReceiptPrint({
  transaction,
}: {
  transaction: Transaction;
}) {
  return (
    <div
      id="print-receipt"
      className="hidden print:block text-[12px] leading-tight font-mono text-black w-[80mm] p-2"
    >
      <div className="text-center space-y-1 mb-3">
        <h2 className="text-lg font-bold uppercase">Frendo POS</h2>
        <p>Jl. Contoh No. 123</p>
        <p>WA: 0812-3456-7890</p>
        <p>================================</p>
      </div>

      <div className="space-y-1 mb-2 uppercase">
        <p>Tgl : {new Date(transaction.created_at).toLocaleString("id-ID")}</p>
        <p>ID : #{transaction.id.slice(0, 8)}</p>
        <p>Ksr : {transaction.users?.name ?? "SYSTEM"}</p>
        <p>--------------------------------</p>
      </div>

      <div className="space-y-2 mb-2">
        {transaction.transaction_items.map((item, i) => (
          <div key={i}>
            <p className="uppercase">{item.products?.name}</p>
            <div className="flex justify-between">
              <span>
                {item.quantity} x {item.price.toLocaleString("id-ID")}
              </span>
              <span>{item.subtotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed pt-2 space-y-1">
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(transaction.total_price)}</span>
        </div>
        <div className="flex justify-between">
          <span>BAYAR</span>
          <span>{formatCurrency(transaction.payment)}</span>
        </div>
        <div className="flex justify-between">
          <span>KEMBALI</span>
          <span>{formatCurrency(transaction.change_amount)}</span>
        </div>
      </div>

      <div className="text-center mt-4 uppercase">
        <p>Terima Kasih</p>
        <p>Barang yang sudah dibeli</p>
        <p>tidak dapat ditukar/dikembalikan</p>
      </div>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
