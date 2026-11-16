// Generated from the Kamy Project schema (Supabase type generator). Do not edit by hand;
// regenerate after each migration.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: number
          ip: string | null
          merchant_id: string | null
          metadata: Json
          request_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          ip?: string | null
          merchant_id?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          ip?: string | null
          merchant_id?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          icon: string
          id: string
          name_en: string
          name_id: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          icon?: string
          id: string
          name_en: string
          name_id: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          icon?: string
          id?: string
          name_en?: string
          name_id?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      licenses: {
        Row: {
          can_en: string[]
          can_id: string[]
          cannot_en: string[]
          cannot_id: string[]
          created_at: string
          id: string
          key: string
          merchant_id: string | null
          name_en: string
          name_id: string
          summary_en: string
          summary_id: string
          version: number
        }
        Insert: {
          can_en?: string[]
          can_id?: string[]
          cannot_en?: string[]
          cannot_id?: string[]
          created_at?: string
          id?: string
          key: string
          merchant_id?: string | null
          name_en: string
          name_id: string
          summary_en: string
          summary_id: string
          version?: number
        }
        Update: {
          can_en?: string[]
          can_id?: string[]
          cannot_en?: string[]
          cannot_id?: string[]
          created_at?: string
          id?: string
          key?: string
          merchant_id?: string | null
          name_en?: string
          name_id?: string
          summary_en?: string
          summary_id?: string
          version?: number
        }
        Relationships: []
      }
      merchant_members: {
        Row: {
          created_at: string
          invited_by: string | null
          merchant_id: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          invited_by?: string | null
          merchant_id: string
          role: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          invited_by?: string | null
          merchant_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_members_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_payout_settings: {
        Row: {
          merchant_id: string
          provider: string | null
          provider_account_ref: string | null
          state: Database["public"]["Enums"]["payout_state"]
          updated_at: string
        }
        Insert: {
          merchant_id: string
          provider?: string | null
          provider_account_ref?: string | null
          state?: Database["public"]["Enums"]["payout_state"]
          updated_at?: string
        }
        Update: {
          merchant_id?: string
          provider?: string | null
          provider_account_ref?: string | null
          state?: Database["public"]["Enums"]["payout_state"]
          updated_at?: string
        }
        Relationships: []
      }
      merchants: {
        Row: {
          avatar_path: string | null
          banner_path: string | null
          bio: string | null
          created_at: string
          deleted_at: string | null
          featured_product_ids: string[]
          id: string
          onboarding_completed_at: string | null
          owner_user_id: string
          pinned_announcement: string | null
          slug: string
          social_links: Json
          specialties: string[]
          store_name: string
          tagline: string | null
          type: Database["public"]["Enums"]["merchant_type"]
          updated_at: string
          verification_state: Database["public"]["Enums"]["verification_state"]
        }
        Insert: {
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          featured_product_ids?: string[]
          id?: string
          onboarding_completed_at?: string | null
          owner_user_id: string
          pinned_announcement?: string | null
          slug: string
          social_links?: Json
          specialties?: string[]
          store_name: string
          tagline?: string | null
          type: Database["public"]["Enums"]["merchant_type"]
          updated_at?: string
          verification_state?: Database["public"]["Enums"]["verification_state"]
        }
        Update: {
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          featured_product_ids?: string[]
          id?: string
          onboarding_completed_at?: string | null
          owner_user_id?: string
          pinned_announcement?: string | null
          slug?: string
          social_links?: Json
          specialties?: string[]
          store_name?: string
          tagline?: string | null
          type?: Database["public"]["Enums"]["merchant_type"]
          updated_at?: string
          verification_state?: Database["public"]["Enums"]["verification_state"]
        }
        Relationships: []
      }
      moderation_events: {
        Row: {
          actor_id: string | null
          created_at: string
          field_ref: string | null
          from_status: Database["public"]["Enums"]["product_status"] | null
          id: string
          policy_ref: string | null
          product_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["product_status"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          field_ref?: string | null
          from_status?: Database["public"]["Enums"]["product_status"] | null
          id?: string
          policy_ref?: string | null
          product_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["product_status"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          field_ref?: string | null
          from_status?: Database["public"]["Enums"]["product_status"] | null
          id?: string
          policy_ref?: string | null
          product_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["product_status"]
        }
        Relationships: []
      }
      policy_acceptances: {
        Row: {
          accepted_at: string
          id: string
          merchant_id: string
          policy_document_id: string
          product_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          merchant_id: string
          policy_document_id: string
          product_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          merchant_id?: string
          policy_document_id?: string
          product_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acceptances_policy_document_id_fkey"
            columns: ["policy_document_id"]
            isOneToOne: false
            referencedRelation: "policy_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_documents: {
        Row: {
          body_en: string
          body_id: string
          created_at: string
          effective_at: string
          id: string
          is_current: boolean
          kind: Database["public"]["Enums"]["policy_kind"]
          summary_en: string[]
          summary_id: string[]
          title_en: string
          title_id: string
          version: string
        }
        Insert: {
          body_en: string
          body_id: string
          created_at?: string
          effective_at?: string
          id?: string
          is_current?: boolean
          kind: Database["public"]["Enums"]["policy_kind"]
          summary_en?: string[]
          summary_id?: string[]
          title_en: string
          title_id: string
          version: string
        }
        Update: {
          body_en?: string
          body_id?: string
          created_at?: string
          effective_at?: string
          id?: string
          is_current?: boolean
          kind?: Database["public"]["Enums"]["policy_kind"]
          summary_en?: string[]
          summary_id?: string[]
          title_en?: string
          title_id?: string
          version?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          current_version_id: string | null
          deleted_at: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          description: string | null
          id: string
          merchant_id: string
          published_at: string | null
          refund_policy: string | null
          requirements: string | null
          slug: string | null
          specifications: Json
          status: Database["public"]["Enums"]["product_status"]
          subcategory_id: string | null
          summary: string | null
          tags: string[]
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
          whats_included: string[]
        }
        Insert: {
          category_id?: string | null
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          description?: string | null
          merchant_id: string
          refund_policy?: string | null
          requirements?: string | null
          slug?: string | null
          specifications?: Json
          subcategory_id?: string | null
          summary?: string | null
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["product_type"]
          whats_included?: string[]
        }
        Update: {
          category_id?: string | null
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          description?: string | null
          refund_policy?: string | null
          requirements?: string | null
          slug?: string | null
          specifications?: Json
          subcategory_id?: string | null
          summary?: string | null
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["product_type"]
          whats_included?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          locale: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          updated_at?: string
        }
        Update: {
          display_name?: string | null
          locale?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          license: string
          product_id: string | null
          product_ref: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          license: string
          product_ref: string
          quantity?: number
        }
        Update: {
          license?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      download_events: {
        Row: {
          created_at: string
          id: number
          product_file_id: string
          user_id: string
        }
        Insert: {
          id?: never
        }
        Update: {
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "download_events_product_file_id_fkey"
            columns: ["product_file_id"]
            isOneToOne: false
            referencedRelation: "product_files"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          id: string
          license: string
          line_total: number
          merchant_id: string | null
          order_id: string
          product_id: string | null
          product_ref: string
          quantity: number
          title: string
          unit_price: number
        }
        Insert: {
          id?: never
        }
        Update: {
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "order_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_id: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: number
          order_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          id?: never
        }
        Update: {
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          closed_at: string | null
          completed_at: string | null
          currency: string
          customer_id: string
          discount_total: number
          id: string
          idempotency_key: string | null
          order_number: string
          paid_at: string | null
          payment_method: string | null
          placed_at: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          id?: never
        }
        Update: {
          id?: never
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string
          granted_by: string | null
          note: string | null
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          user_id?: never
        }
        Update: {
          user_id?: never
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          product_id: string | null
          product_ref: string
          user_id: string
        }
        Insert: {
          product_ref: string
        }
        Update: {
          product_ref?: never
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_policy: {
        Args: { p_document: string; p_merchant: string }
        Returns: string
      }
      admin_overview: { Args: never; Returns: Json }
      create_merchant: {
        Args: {
          p_slug: string
          p_specialties?: string[]
          p_store_name: string
          p_tagline?: string
          p_type: Database["public"]["Enums"]["merchant_type"]
        }
        Returns: string
      }
      is_slug_available: { Args: { p_slug: string }; Returns: boolean }
      my_library: {
        Args: never
        Returns: {
          file_id: string
          filename: string
          license: string
          order_item_id: string
          order_number: string
          product_ref: string
          purchased_at: string
          size_bytes: number
          title: string
          version_label: string
        }[]
      }
      request_download: {
        Args: { p_file: string }
        Returns: {
          filename: string
          storage_key: string
        }[]
      }
    }
    Enums: {
      delivery_method: "instant_download" | "access_link" | "manual"
      delivery_status: "pending" | "available" | "delivered" | "revoked"
      media_kind: "image" | "video_link" | "model_3d" | "audio" | "document_page"
      member_role: "owner" | "admin" | "editor" | "support" | "viewer"
      member_status: "invited" | "active" | "removed"
      merchant_type: "individual" | "studio"
      order_status:
        | "pending_payment"
        | "pending_delivery"
        | "delivered"
        | "completed"
        | "cancelled"
        | "refunded"
      payout_state: "not_connected" | "pending" | "connected" | "restricted"
      platform_role: "support" | "moderator" | "finance" | "superadmin"
      policy_kind: "seller_agreement" | "ownership_declaration"
      product_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "approved"
        | "changes_requested"
        | "rejected"
        | "published"
        | "unpublished"
        | "suspended"
      product_type: "digital_file" | "bundle" | "service" | "template" | "course" | "software"
      scan_status: "pending" | "clean" | "infected" | "skipped"
      verification_state: "unverified" | "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]
