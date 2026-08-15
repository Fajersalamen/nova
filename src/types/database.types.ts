// Hand-written to match supabase/migrations/0001_schema.sql, in the same
// shape the Supabase type generator emits. Once a real project exists,
// regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled';
export type AdminRole = 'owner' | 'staff';

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          phone_whatsapp: string;
          address: string | null;
          google_maps_embed_url: string | null;
          google_place_id: string | null;
          logo_url: string | null;
          theme_settings: Json;
          subscription_status: SubscriptionStatus;
          tagline: string | null;
          hero_description: string | null;
          hours_label: string | null;
          has_dine_in: boolean;
          has_delivery: boolean;
          has_drive_thru: boolean;
          about_title: string | null;
          about_body: string | null;
          about_image_url: string | null;
          home_cta_heading: string | null;
          menu_cta_heading: string | null;
          contact_cta_heading: string | null;
          about_hero_title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          phone_whatsapp: string;
          address?: string | null;
          google_maps_embed_url?: string | null;
          google_place_id?: string | null;
          logo_url?: string | null;
          theme_settings?: Json;
          subscription_status?: SubscriptionStatus;
          tagline?: string | null;
          hero_description?: string | null;
          hours_label?: string | null;
          has_dine_in?: boolean;
          has_delivery?: boolean;
          has_drive_thru?: boolean;
          about_title?: string | null;
          about_body?: string | null;
          about_image_url?: string | null;
          home_cta_heading?: string | null;
          menu_cta_heading?: string | null;
          contact_cta_heading?: string | null;
          about_hero_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          phone_whatsapp?: string;
          address?: string | null;
          google_maps_embed_url?: string | null;
          google_place_id?: string | null;
          logo_url?: string | null;
          theme_settings?: Json;
          subscription_status?: SubscriptionStatus;
          tagline?: string | null;
          hero_description?: string | null;
          hours_label?: string | null;
          has_dine_in?: boolean;
          has_delivery?: boolean;
          has_drive_thru?: boolean;
          about_title?: string | null;
          about_body?: string | null;
          about_image_url?: string | null;
          home_cta_heading?: string | null;
          menu_cta_heading?: string | null;
          contact_cta_heading?: string | null;
          about_hero_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          restaurant_id: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          id: string;
          restaurant_id: string;
          role?: AdminRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          role?: AdminRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_users_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      menu_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_categories_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          video_url: string | null;
          is_available: boolean;
          display_order: number;
          tag: string | null;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          video_url?: string | null;
          is_available?: boolean;
          display_order?: number;
          tag?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          video_url?: string | null;
          is_available?: boolean;
          display_order?: number;
          tag?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_items_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'menu_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'menu_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          customer_name: string;
          rating: number;
          comment: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          customer_name: string;
          rating: number;
          comment?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          customer_name?: string;
          rating?: number;
          comment?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      restaurant_branches: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          address: string | null;
          phone_whatsapp: string;
          google_maps_embed_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          address?: string | null;
          phone_whatsapp: string;
          google_maps_embed_url?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          address?: string | null;
          phone_whatsapp?: string;
          google_maps_embed_url?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_branches_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_restaurant_admin: {
        Args: { target_restaurant_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
export type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type RestaurantBranch = Database['public']['Tables']['restaurant_branches']['Row'];
