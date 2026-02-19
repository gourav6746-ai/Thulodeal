
export type Category = 'shirts' | 'jeans' | 'shoes' | 'jackets' | 'accessories' | 'bundles';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  sizes: string[];
  imageURLs: string[];
  description: string;
  stock: number;
  createdAt: number;
}

export interface Bundle {
  id: string;
  name: string;
  price: number;
  productIds: string[];
  imageURL: string;
  description: string;
  active: boolean;
  createdAt: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number; // Percentage
  isActive: boolean;
  expiryDate?: string;
}

export interface SiteOffer {
  id: string;
  type: 'B2G1'; // Buy 2 Get 1
  isActive: boolean;
  targetCategory?: Category;
}

export interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
  isBundle?: boolean;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'COD' | 'eSewa' | 'Khalti' | 'Binance';
export type PaymentStatus = 'Submitted' | 'Verifying' | 'Confirmed' | 'Failed';

export interface PaymentDetails {
  senderId?: string;
  transactionId?: string;
  screenshotURL?: string; // New field for trust
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  totalPrice: number;
  discountAmount?: number;
  promoCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus; // New field
  paymentDetails?: PaymentDetails;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
  };
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
}
