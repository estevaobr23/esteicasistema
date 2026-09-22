export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          business_id: string
          created_at: string
          event_type: string
          id: string
          service_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          event_type: string
          id?: string
          service_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          event_type?: string
          id?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          active: boolean
          business_id: string
          id: string
          time: string
          weekday: number
        }
        Insert: {
          active?: boolean
          business_id: string
          id?: string
          time: string
          weekday: number
        }
        Update: {
          active?: boolean
          business_id?: string
          id?: string
          time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          about: string | null
          address: string | null
          branding_video_url: string | null
          business_hours: Json | null
          city: string | null
          cover_url: string | null
          created_at: string
          email: string | null
          headline: string | null
          highlights: Json
          id: string
          instagram: string | null
          logo_url: string | null
          map_url: string | null
          name: string
          onboarding_completo: boolean
          owner_id: string
          phone: string | null
          plano: string
          primary_color: string
          published: boolean
          secondary_color: string
          sections_config: Json
          slug: string
          theme: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          branding_video_url?: string | null
          business_hours?: Json | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          headline?: string | null
          highlights?: Json
          id?: string
          instagram?: string | null
          logo_url?: string | null
          map_url?: string | null
          name: string
          onboarding_completo?: boolean
          owner_id: string
          phone?: string | null
          plano: string
          primary_color?: string
          published?: boolean
          secondary_color?: string
          sections_config?: Json
          slug: string
          theme?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          branding_video_url?: string | null
          business_hours?: Json | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          headline?: string | null
          highlights?: Json
          id?: string
          instagram?: string | null
          logo_url?: string | null
          map_url?: string | null
          name?: string
          onboarding_completo?: boolean
          owner_id?: string
          phone?: string | null
          plano?: string
          primary_color?: string
          published?: boolean
          secondary_color?: string
          sections_config?: Json
          slug?: string
          theme?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      package_services: {
        Row: {
          package_id: string
          service_id: string
        }
        Insert: {
          package_id: string
          service_id: string
        }
        Update: {
          package_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_services_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          active: boolean
          business_id: string
          cta_label: string | null
          description: string | null
          featured: boolean
          id: string
          image_url: string | null
          name: string
          price: number
          promotional_price: number | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          business_id: string
          cta_label?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          name: string
          price: number
          promotional_price?: number | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          business_id?: string
          cta_label?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          promotional_price?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          active: boolean
          after_image: string
          before_image: string
          business_id: string
          category: string | null
          description: string | null
          id: string
          service_id: string | null
          sort_order: number
          title: string | null
          vehicle: string | null
        }
        Insert: {
          active?: boolean
          after_image: string
          before_image: string
          business_id: string
          category?: string | null
          description?: string | null
          id?: string
          service_id?: string | null
          sort_order?: number
          title?: string | null
          vehicle?: string | null
        }
        Update: {
          active?: boolean
          after_image?: string
          before_image?: string
          business_id?: string
          category?: string | null
          description?: string | null
          id?: string
          service_id?: string | null
          sort_order?: number
          title?: string | null
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          email: string
          id: string
          plano: string
          status: string
          transaction_id: string
          usado_em: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          plano: string
          status: string
          transaction_id: string
          usado_em?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          plano?: string
          status?: string
          transaction_id?: string
          usado_em?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          customer_name: string
          id: string
          rating: number
          text: string | null
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          customer_name: string
          id?: string
          rating: number
          text?: string | null
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          customer_name?: string
          id?: string
          rating?: number
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      service_features: {
        Row: {
          id: string
          label: string
          service_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          service_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          service_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_features_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_prices: {
        Row: {
          active: boolean
          id: string
          price: number
          promotional_price: number | null
          service_id: string
          vehicle_type: string
        }
        Insert: {
          active?: boolean
          id?: string
          price: number
          promotional_price?: number | null
          service_id: string
          vehicle_type: string
        }
        Update: {
          active?: boolean
          id?: string
          price?: number
          promotional_price?: number | null
          service_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_templates: {
        Row: {
          category: string | null
          default_features: string[]
          description: string | null
          id: string
          name: string
          short_description: string | null
          sort_order: number
        }
        Insert: {
          category?: string | null
          default_features?: string[]
          description?: string | null
          id?: string
          name: string
          short_description?: string | null
          sort_order?: number
        }
        Update: {
          category?: string | null
          default_features?: string[]
          description?: string | null
          id?: string
          name?: string
          short_description?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          after_image: string | null
          base_price: number | null
          before_image: string | null
          business_id: string
          category: string | null
          created_at: string
          cta_label: string | null
          description: string | null
          duration_minutes: number | null
          featured: boolean
          gallery: Json
          id: string
          image_url: string | null
          media_mode: string
          name: string
          price_type: string
          short_description: string | null
          slug: string | null
          sort_order: number
          video_url: string | null
        }
        Insert: {
          active?: boolean
          after_image?: string | null
          base_price?: number | null
          before_image?: string | null
          business_id: string
          category?: string | null
          created_at?: string
          cta_label?: string | null
          description?: string | null
          duration_minutes?: number | null
          featured?: boolean
          gallery?: Json
          id?: string
          image_url?: string | null
          media_mode?: string
          name: string
          price_type?: string
          short_description?: string | null
          slug?: string | null
          sort_order?: number
          video_url?: string | null
        }
        Update: {
          active?: boolean
          after_image?: string | null
          base_price?: number | null
          before_image?: string | null
          business_id?: string
          category?: string | null
          created_at?: string
          cta_label?: string | null
          description?: string | null
          duration_minutes?: number | null
          featured?: boolean
          gallery?: Json
          id?: string
          image_url?: string | null
          media_mode?: string
          name?: string
          price_type?: string
          short_description?: string | null
          slug?: string | null
          sort_order?: number
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
