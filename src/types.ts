export interface ProductSpecs {
  scientificName: string;
  thaiName: string;
  origin: string;
  size: string;
  hornCount: number;
  lifespan: string;
  diet: string;
  temperature: string;
  humidity: string;
}

export interface Product {
  id: string;
  name: string;
  subname: string;
  category: 'male_short' | 'male_long' | 'female' | 'accessory';
  price: number;
  originalPrice: number;
  stock: number;
  remainingAlert?: string;
  badge?: string;
  isBestSeller?: boolean;
  description: string;
  longDescription: string;
  image: string;
  galleryImages: string[];
  specs: ProductSpecs;
  inBoxIncludes: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  paymentMethod: 'promptpay' | 'credit_card' | 'line';
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  slipImage?: string;
  status: 'pending_payment' | 'paid_verified' | 'preparing' | 'shipped';
  trackingNumber?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  description: string;
}
