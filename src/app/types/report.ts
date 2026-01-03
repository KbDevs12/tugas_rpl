export interface Transaction {
  created_at: string;
  total_price: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

export interface CategoryRevenue {
  category_id: string;
  category_name: string;
  revenue: number;
}

export interface ReportStats {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  averageTransaction: number;
}

export interface ReportData {
  stats: ReportStats;
  dailyRevenue: DailyRevenue[];
  topProducts: TopProduct[];
  categoryRevenue: CategoryRevenue[];
}
