export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ad_slot: {
        Row: {
          description: string | null
          id: string
          key: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      affiliate_link: {
        Row: {
          active: boolean | null
          base_domain: string | null
          country: string | null
          created_at: string | null
          deeplink_template: string | null
          epc_estimate: number | null
          id: string
          logo_url: string | null
          merchant: string | null
          network: string | null
          notes: string | null
          partner: string
          status: string | null
          tracking_key: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          active?: boolean | null
          base_domain?: string | null
          country?: string | null
          created_at?: string | null
          deeplink_template?: string | null
          epc_estimate?: number | null
          id?: string
          logo_url?: string | null
          merchant?: string | null
          network?: string | null
          notes?: string | null
          partner: string
          status?: string | null
          tracking_key?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          active?: boolean | null
          base_domain?: string | null
          country?: string | null
          created_at?: string | null
          deeplink_template?: string | null
          epc_estimate?: number | null
          id?: string
          logo_url?: string | null
          merchant?: string | null
          network?: string | null
          notes?: string | null
          partner?: string
          status?: string | null
          tracking_key?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      bf_merchant: {
        Row: {
          affiliate_link_id: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          affiliate_link_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          affiliate_link_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_merchant_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_link"
            referencedColumns: ["id"]
          },
        ]
      }
      category: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          sort: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          sort?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          sort?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      click: {
        Row: {
          campaign: string | null
          created_at: string | null
          entity_id: string
          id: number
          ip: unknown | null
          ip_hash: string | null
          kind: string
          path: string | null
          referrer: string | null
          subid: string | null
          ua_hash: string | null
          user_agent: string | null
          utm: Json | null
        }
        Insert: {
          campaign?: string | null
          created_at?: string | null
          entity_id: string
          id?: number
          ip?: unknown | null
          ip_hash?: string | null
          kind: string
          path?: string | null
          referrer?: string | null
          subid?: string | null
          ua_hash?: string | null
          user_agent?: string | null
          utm?: Json | null
        }
        Update: {
          campaign?: string | null
          created_at?: string | null
          entity_id?: string
          id?: number
          ip?: unknown | null
          ip_hash?: string | null
          kind?: string
          path?: string | null
          referrer?: string | null
          subid?: string | null
          ua_hash?: string | null
          user_agent?: string | null
          utm?: Json | null
        }
        Relationships: []
      }
      competition: {
        Row: {
          area: string | null
          code: string
          created_at: string | null
          external: Json | null
          id: string
          name: string
          season: number | null
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          code: string
          created_at?: string | null
          external?: Json | null
          id?: string
          name: string
          season?: number | null
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          code?: string
          created_at?: string | null
          external?: Json | null
          id?: string
          name?: string
          season?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      countdown: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          image_url: string | null
          owner_id: string | null
          privacy: string
          reject_reason: string | null
          seo_description: string | null
          seo_h1: string | null
          seo_title: string | null
          slug: string | null
          status: string
          target_at: string
          theme: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          owner_id?: string | null
          privacy?: string
          reject_reason?: string | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          target_at: string
          theme?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          owner_id?: string | null
          privacy?: string
          reject_reason?: string | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          target_at?: string
          theme?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event: {
        Row: {
          category_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          editorial_status: string | null
          end_at: string | null
          id: string
          image_url: string | null
          is_recurring: boolean | null
          location_city: string | null
          official_site: string | null
          official_source_url: string | null
          og_theme: string | null
          rrule: string | null
          seo_description: string | null
          seo_faq: Json | null
          seo_h1: string | null
          seo_title: string | null
          slug: string
          start_at: string
          status: string
          timezone: string
          title: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          category_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          editorial_status?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          location_city?: string | null
          official_site?: string | null
          official_source_url?: string | null
          og_theme?: string | null
          rrule?: string | null
          seo_description?: string | null
          seo_faq?: Json | null
          seo_h1?: string | null
          seo_title?: string | null
          slug: string
          start_at: string
          status?: string
          timezone?: string
          title: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          category_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          editorial_status?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          location_city?: string | null
          official_site?: string | null
          official_source_url?: string | null
          og_theme?: string | null
          rrule?: string | null
          seo_description?: string | null
          seo_faq?: Json | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string
          start_at?: string
          status?: string
          timezone?: string
          title?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      event_offer: {
        Row: {
          affiliate_link_id: string
          event_id: string
        }
        Insert: {
          affiliate_link_id: string
          event_id: string
        }
        Update: {
          affiliate_link_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_offer_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_offer_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
      follow: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ingestion_log: {
        Row: {
          id: number
          message: string | null
          ran_at: string | null
          rows: number | null
          source: string | null
          status: string | null
        }
        Insert: {
          id?: number
          message?: string | null
          ran_at?: string | null
          rows?: number | null
          source?: string | null
          status?: string | null
        }
        Update: {
          id?: number
          message?: string | null
          ran_at?: string | null
          rows?: number | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      match: {
        Row: {
          away: string
          city: string | null
          competition_id: string | null
          created_at: string | null
          home: string
          id: string
          is_derby: boolean | null
          kickoff_at: string
          round: string | null
          score: Json | null
          seo_description: string | null
          seo_h1: string | null
          seo_title: string | null
          slug: string | null
          stadium: string | null
          status: string
          tv_channels: string[] | null
          updated_at: string | null
        }
        Insert: {
          away: string
          city?: string | null
          competition_id?: string | null
          created_at?: string | null
          home: string
          id?: string
          is_derby?: boolean | null
          kickoff_at: string
          round?: string | null
          score?: Json | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          stadium?: string | null
          status?: string
          tv_channels?: string[] | null
          updated_at?: string | null
        }
        Update: {
          away?: string
          city?: string | null
          competition_id?: string | null
          created_at?: string | null
          home?: string
          id?: string
          is_derby?: boolean | null
          kickoff_at?: string
          round?: string | null
          score?: Json | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          stadium?: string | null
          status?: string
          tv_channels?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["id"]
          },
        ]
      }
      match_offer: {
        Row: {
          affiliate_link_id: string
          match_id: string
        }
        Insert: {
          affiliate_link_id: string
          match_id: string
        }
        Update: {
          affiliate_link_id?: string
          match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_offer_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_offer_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match"
            referencedColumns: ["id"]
          },
        ]
      }
      movie: {
        Row: {
          backdrop_url: string | null
          cinema_release_ro: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          netflix_date: string | null
          original_title: string | null
          overview: string | null
          poster_url: string | null
          prime_date: string | null
          provider: Json | null
          seo_description: string | null
          seo_h1: string | null
          seo_title: string | null
          slug: string | null
          source: Json | null
          status: string
          title: string
          tmdb_id: number
          trailer_youtube_key: string | null
          updated_at: string | null
        }
        Insert: {
          backdrop_url?: string | null
          cinema_release_ro?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          netflix_date?: string | null
          original_title?: string | null
          overview?: string | null
          poster_url?: string | null
          prime_date?: string | null
          provider?: Json | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          source?: Json | null
          status?: string
          title: string
          tmdb_id: number
          trailer_youtube_key?: string | null
          updated_at?: string | null
        }
        Update: {
          backdrop_url?: string | null
          cinema_release_ro?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          netflix_date?: string | null
          original_title?: string | null
          overview?: string | null
          poster_url?: string | null
          prime_date?: string | null
          provider?: Json | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          source?: Json | null
          status?: string
          title?: string
          tmdb_id?: number
          trailer_youtube_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscriber: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string
          theme_pref: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string
          theme_pref?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string
          theme_pref?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminder: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          offset_days: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          offset_days: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          offset_days?: number
          user_id?: string
        }
        Relationships: []
      }
      seo_template: {
        Row: {
          code: string
          entity_type: string
          faq: Json | null
          h1_tmpl: string
          is_default: boolean | null
          meta_desc_tmpl: string
          og_theme: string | null
          title_tmpl: string
        }
        Insert: {
          code: string
          entity_type: string
          faq?: Json | null
          h1_tmpl: string
          is_default?: boolean | null
          meta_desc_tmpl: string
          og_theme?: string | null
          title_tmpl: string
        }
        Update: {
          code?: string
          entity_type?: string
          faq?: Json | null
          h1_tmpl?: string
          is_default?: boolean | null
          meta_desc_tmpl?: string
          og_theme?: string | null
          title_tmpl?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_alias: {
        Row: {
          alias: string
          canonical: string
          created_at: string
        }
        Insert: {
          alias: string
          canonical: string
          created_at?: string
        }
        Update: {
          alias?: string
          canonical?: string
          created_at?: string
        }
        Relationships: []
      }
      tv_channel_alias: {
        Row: {
          alias: string
          canonical: string
          created_at: string
          priority: number
        }
        Insert: {
          alias: string
          canonical: string
          created_at?: string
          priority?: number
        }
        Update: {
          alias?: string
          canonical?: string
          created_at?: string
          priority?: number
        }
        Relationships: []
      }
      ugc_quota: {
        Row: {
          created_at: string | null
          id: number
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          kind?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ugc_queue: {
        Row: {
          created_at: string | null
          date_at: string | null
          id: string | null
          kind: string | null
          owner_id: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          date_at?: string | null
          id?: string | null
          kind?: never
          owner_id?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          date_at?: string | null
          id?: string | null
          kind?: never
          owner_id?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      compute_event_seo: {
        Args: { e: Database["public"]["Tables"]["event"]["Row"] }
        Returns: {
          category_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          editorial_status: string | null
          end_at: string | null
          id: string
          image_url: string | null
          is_recurring: boolean | null
          location_city: string | null
          official_site: string | null
          official_source_url: string | null
          og_theme: string | null
          rrule: string | null
          seo_description: string | null
          seo_faq: Json | null
          seo_h1: string | null
          seo_title: string | null
          slug: string
          start_at: string
          status: string
          timezone: string
          title: string
          updated_at: string | null
          verified_at: string | null
        }
      }
      compute_match_seo: {
        Args: { m: Database["public"]["Tables"]["match"]["Row"] }
        Returns: {
          away: string
          city: string | null
          competition_id: string | null
          created_at: string | null
          home: string
          id: string
          is_derby: boolean | null
          kickoff_at: string
          round: string | null
          score: Json | null
          seo_description: string | null
          seo_h1: string | null
          seo_title: string | null
          slug: string | null
          stadium: string | null
          status: string
          tv_channels: string[] | null
          updated_at: string | null
        }
      }
      compute_movie_seo: {
        Args: { x: Database["public"]["Tables"]["movie"]["Row"] }
        Returns: {
          backdrop_url: string | null
          cinema_release_ro: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          netflix_date: string | null
          original_title: string | null
          overview: string | null
          poster_url: string | null
          prime_date: string | null
          provider: Json | null
          seo_description: string | null
          seo_h1: string | null
          seo_title: string | null
          slug: string | null
          source: Json | null
          status: string
          title: string
          tmdb_id: number
          trailer_youtube_key: string | null
          updated_at: string | null
        }
      }
      current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      render_template: {
        Args: { tmpl: string; vars: Json }
        Returns: string
      }
      slugify: {
        Args: { txt: string }
        Returns: string
      }
      ugc_quota_exceeded: {
        Args: { p_user: string; p_kind?: string }
        Returns: boolean
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
