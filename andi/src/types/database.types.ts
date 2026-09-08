// Hand-written types mirroring supabase/migrations/0001_schema.sql.
// In production, prefer `supabase gen types typescript` once the project is
// live — kept hand-written here so the schema and app can be reviewed
// together without a Supabase CLI round-trip.

export type RentalStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "ready_for_pickup"
  | "active"
  | "returned"
  | "completed"
  | "cancelled";

export type ItemStatus = "available" | "rented" | "paused";

export interface Area {
  id: number;
  city: string;
  name_ar: string;
  name_en: string | null;
  lat: number | null;
  lng: number | null;
  sort_order: number;
}

export interface Category {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: boolean;
  city: string;
  area_id: number | null;
  bio: string | null;
  rating_avg: number;
  rating_count: number;
  rentals_as_renter_count: number;
  rentals_as_owner_count: number;
  trust_score: number;
  is_verified: boolean;
  is_banned: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemImage {
  id: string;
  item_id: string;
  url: string;
  sort_order: number;
}

export interface Item {
  id: string;
  owner_id: string;
  category_id: number;
  title: string;
  description: string;
  price_per_day: number;
  price_per_week: number | null;
  deposit_amount: number;
  min_rental_days: number;
  max_rental_days: number;
  area_id: number;
  approx_lat: number;
  approx_lng: number;
  status: ItemStatus;
  rating_avg: number;
  rating_count: number;
  rental_count: number;
  view_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export type ItemWithRelations = Item & {
  item_images: ItemImage[];
  areas: Pick<Area, "id" | "name_ar" | "name_en">;
  categories: Pick<Category, "id" | "slug" | "name_ar" | "icon">;
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url" | "rating_avg" | "rating_count" | "is_verified" | "created_at">;
  distance_km?: number;
};

export interface ItemBlockedDate {
  id: string;
  item_id: string;
  blocked_date: string;
  reason: "owner" | "rental";
  rental_id: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

export interface Rental {
  id: string;
  item_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  price_per_day: number;
  subtotal: number;
  deposit_amount: number;
  platform_fee: number;
  total_amount: number;
  status: RentalStatus;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type RentalWithRelations = Rental & {
  items: Pick<Item, "id" | "title"> & { item_images: Pick<ItemImage, "url">[] };
  renter: Pick<Profile, "id" | "full_name" | "avatar_url">;
  owner: Pick<Profile, "id" | "full_name" | "avatar_url">;
};

export interface SecurityDeposit {
  id: string;
  rental_id: string;
  amount: number;
  status: "held" | "released" | "claimed";
  claim_reason: string | null;
  released_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  rental_id: string;
  amount: number;
  currency: string;
  provider: "mock" | "cliq" | "card" | "wallet";
  provider_ref: string | null;
  type: "rental_payment" | "deposit_hold" | "deposit_release" | "refund";
  status: "pending" | "paid" | "refunded" | "failed";
  created_at: string;
}

export interface Review {
  id: string;
  rental_id: string;
  reviewer_id: string;
  reviewee_id: string;
  role: "renter_to_owner" | "owner_to_renter";
  rating: number;
  tags: string[];
  comment: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  item_id: string;
  rental_id: string | null;
  renter_id: string;
  owner_id: string;
  last_message_at: string | null;
  created_at: string;
}

export type ConversationWithRelations = Conversation & {
  items: Pick<Item, "id" | "title"> & { item_images: Pick<ItemImage, "url">[] };
  other_user: Pick<Profile, "id" | "full_name" | "avatar_url">;
  last_message?: Pick<Message, "content" | "type" | "created_at">;
};

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: "text" | "image" | "location";
  content: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  read_at: string | null;
  created_at: string;
}

export type NotificationType =
  | "new_rental_request"
  | "rental_accepted"
  | "rental_rejected"
  | "pickup_reminder"
  | "rental_completed"
  | "new_message"
  | "new_review"
  | "saved_item_available";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: "user" | "item";
  target_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
}

export interface PlatformSettings {
  id: number;
  commission_percent: number;
  platform_fee_flat: number;
  min_rental_days: number;
  max_rental_days: number;
}
