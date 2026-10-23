export type VideoCategory = 'All' | '1' | '2' | '3' | '4' | '5' | '6' | '7';

export interface VideoItem {
  id: string;
  title: string;
  titleBn: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: VideoCategory;
  views: string;
  rating: string;
  quality: '4K Ultra HD' | '1080p IMAX' | '8K Master';
  isVipOnly: boolean;
  priceTaka: number;
  description: string;
  descriptionBn: string;
  director?: string;
  year: string;
  dateAdded: number;
  isUserAdded?: boolean;
}

export interface SubscriptionRequest {
  id: string;
  phone: string;
  trxId: string;
  method: string;
  amount: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  note?: string;
}

export interface ApprovedSubscriber {
  phone: string;
  approvedAt: string;
  expiresAt: string;
  source: string;
}

export interface SubscriptionStatus {
  isVip: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'none';
  phone?: string;
  planType?: 'monthly' | 'yearly';
  expiryDate?: string;
  memberSince?: string;
  transactionId?: string;
  paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'card' | 'telegram';
}

export type Language = 'bn' | 'en';
