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
      affiliate_kpi_daily: {
        Row: {
          affiliate_link_id: string
          clicks: number
          day: string
          est_revenue: number
          merchant: string | null
        }
        Insert: {
          affiliate_link_id?: string
          clicks?: number
          day: string
          est_revenue?: number
          merchant?: string | null
        }
        Update: {
          affiliate_link_id?: string
          clicks?: number
          day?: string
          est_revenue?: number
          merchant?: string | null
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
      bf_category: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      bf_merchant: {
        Row: {
          active: boolean | null
          affiliate_base_url: string | null
          affiliate_link_id: string | null
          created_at: string | null
          epc_estimate: number | null
          id: string
          logo_url: string | null
          name: string
          priority: number | null
          program_url: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          affiliate_base_url?: string | null
          affiliate_link_id?: string | null
          created_at?: string | null
          epc_estimate?: number | null
          id?: string
          logo_url?: string | null
          name: string
          priority?: number | null
          program_url?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          affiliate_base_url?: string | null
          affiliate_link_id?: string | null
          created_at?: string | null
          epc_estimate?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          priority?: number | null
          program_url?: string | null
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
      bf_offer: {
        Row: {
          affiliate_link_id: string | null
          category_id: string | null
          created_at: string | null
          discount_percent: number | null
          ends_at: string | null
          id: string
          image_url: string | null
          merchant_id: string
          price: number | null
          price_old: number | null
          product_url: string | null
          score: number | null
          starts_at: string | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affiliate_link_id?: string | null
          category_id?: string | null
          created_at?: string | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          merchant_id: string
          price?: number | null
          price_old?: number | null
          product_url?: string | null
          score?: number | null
          starts_at?: string | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affiliate_link_id?: string | null
          category_id?: string | null
          created_at?: string | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          merchant_id?: string
          price?: number | null
          price_old?: number | null
          product_url?: string | null
          score?: number | null
          starts_at?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_offer_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_link"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_offer_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "bf_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_offer_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "bf_merchant"
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
      city: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
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
          search_tsv: unknown | null
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
          search_tsv?: unknown | null
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
          search_tsv?: unknown | null
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
      deployment_log: {
        Row: {
          actor: string | null
          build_id: string | null
          created_at: string | null
          finished_at: string | null
          id: number
          notes: string | null
          reason: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          actor?: string | null
          build_id?: string | null
          created_at?: string | null
          finished_at?: string | null
          id?: number
          notes?: string | null
          reason?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          actor?: string | null
          build_id?: string | null
          created_at?: string | null
          finished_at?: string | null
          id?: number
          notes?: string | null
          reason?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      derby: {
        Row: {
          id: string
          importance: number | null
          league_id: string
          name: string
          team_a: string
          team_a_id: string | null
          team_b: string
          team_b_id: string | null
        }
        Insert: {
          id?: string
          importance?: number | null
          league_id: string
          name: string
          team_a: string
          team_a_id?: string | null
          team_b: string
          team_b_id?: string | null
        }
        Update: {
          id?: string
          importance?: number | null
          league_id?: string
          name?: string
          team_a?: string
          team_a_id?: string | null
          team_b?: string
          team_b_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "derby_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "derby_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "derby_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      email_unsub: {
        Row: {
          created_at: string | null
          kind: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          kind?: string
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          kind?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      event: {
        Row: {
          category_id: string | null
          city: string | null
          city_id: string | null
          country: string | null
          created_at: string | null
          curated: boolean | null
          description: string | null
          editorial_status: string | null
          end_at: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_recurring: boolean | null
          location_city: string | null
          moderation_notes: string | null
          moderator_id: string | null
          official_site: string | null
          official_source_url: string | null
          official_url: string | null
          og_theme: string | null
          rrule: string | null
          search_tsv: unknown | null
          seo_description: string | null
          seo_faq: Json | null
          seo_h1: string | null
          seo_title: string | null
          slug: string
          start_at: string
          starts_at: string | null
          status: string
          submitted_by: string | null
          subtitle: string | null
          tickets_affiliate_link_id: string | null
          timezone: string
          title: string
          updated_at: string | null
          venue_id: string | null
          verified_at: string | null
        }
        Insert: {
          category_id?: string | null
          city?: string | null
          city_id?: string | null
          country?: string | null
          created_at?: string | null
          curated?: boolean | null
          description?: string | null
          editorial_status?: string | null
          end_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          location_city?: string | null
          moderation_notes?: string | null
          moderator_id?: string | null
          official_site?: string | null
          official_source_url?: string | null
          official_url?: string | null
          og_theme?: string | null
          rrule?: string | null
          search_tsv?: unknown | null
          seo_description?: string | null
          seo_faq?: Json | null
          seo_h1?: string | null
          seo_title?: string | null
          slug: string
          start_at: string
          starts_at?: string | null
          status?: string
          submitted_by?: string | null
          subtitle?: string | null
          tickets_affiliate_link_id?: string | null
          timezone?: string
          title: string
          updated_at?: string | null
          venue_id?: string | null
          verified_at?: string | null
        }
        Update: {
          category_id?: string | null
          city?: string | null
          city_id?: string | null
          country?: string | null
          created_at?: string | null
          curated?: boolean | null
          description?: string | null
          editorial_status?: string | null
          end_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_recurring?: boolean | null
          location_city?: string | null
          moderation_notes?: string | null
          moderator_id?: string | null
          official_site?: string | null
          official_source_url?: string | null
          official_url?: string | null
          og_theme?: string | null
          rrule?: string | null
          search_tsv?: unknown | null
          seo_description?: string | null
          seo_faq?: Json | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string
          start_at?: string
          starts_at?: string | null
          status?: string
          submitted_by?: string | null
          subtitle?: string | null
          tickets_affiliate_link_id?: string | null
          timezone?: string
          title?: string
          updated_at?: string | null
          venue_id?: string | null
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
          {
            foreignKeyName: "event_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue"
            referencedColumns: ["id"]
          },
        ]
      }
      event_category: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      event_moderation_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string | null
          event_id: string
          id: number
          reason: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string | null
          event_id: string
          id?: number
          reason?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string | null
          event_id?: string
          id?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_moderation_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
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
      event_tag: {
        Row: {
          event_id: string
          tag_id: string
        }
        Insert: {
          event_id: string
          tag_id: string
        }
        Update: {
          event_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tag_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
        ]
      }
      exam: {
        Row: {
          created_at: string | null
          id: string
          level: string
          name: string
          official_ref: string | null
          slug: string
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          name: string
          official_ref?: string | null
          slug: string
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          name?: string
          official_ref?: string | null
          slug?: string
          year?: number
        }
        Relationships: []
      }
      exam_phase: {
        Row: {
          created_at: string | null
          ends_on: string
          exam_id: string
          id: string
          name: string
          slug: string
          starts_on: string
        }
        Insert: {
          created_at?: string | null
          ends_on: string
          exam_id: string
          id?: string
          name: string
          slug: string
          starts_on: string
        }
        Update: {
          created_at?: string | null
          ends_on?: string
          exam_id?: string
          id?: string
          name?: string
          slug?: string
          starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_phase_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam"
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
      follow_channel: {
        Row: {
          channel_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "tv_channel"
            referencedColumns: ["id"]
          },
        ]
      }
      health_check_log: {
        Row: {
          checked_at: string | null
          checks: Json | null
          created_at: string | null
          id: number
          response_time_ms: number | null
          status: string
        }
        Insert: {
          checked_at?: string | null
          checks?: Json | null
          created_at?: string | null
          id?: number
          response_time_ms?: number | null
          status: string
        }
        Update: {
          checked_at?: string | null
          checks?: Json | null
          created_at?: string | null
          id?: number
          response_time_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      holiday: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          kind: string
          name: string
          official_ref: string | null
          rule: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          kind: string
          name: string
          official_ref?: string | null
          rule: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          kind?: string
          name?: string
          official_ref?: string | null
          rule?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      holiday_instance: {
        Row: {
          created_at: string | null
          date: string
          date_end: string | null
          holiday_id: string
          id: string
          is_weekend: boolean
          year: number
        }
        Insert: {
          created_at?: string | null
          date: string
          date_end?: string | null
          holiday_id: string
          id?: string
          is_weekend?: boolean
          year: number
        }
        Update: {
          created_at?: string | null
          date?: string
          date_end?: string | null
          holiday_id?: string
          id?: string
          is_weekend?: boolean
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "holiday_instance_holiday_id_fkey"
            columns: ["holiday_id"]
            isOneToOne: false
            referencedRelation: "holiday"
            referencedColumns: ["id"]
          },
        ]
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
      ip_allowlist: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          ip: unknown
          note: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ip: unknown
          note?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ip?: unknown
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_allowlist_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_blocklist: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          ip: unknown
          reason: string
          until: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ip: unknown
          reason: string
          until: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ip?: unknown
          reason?: string
          until?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_blocklist_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      league: {
        Row: {
          country: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          country?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          country?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      match: {
        Row: {
          away: string
          away_id: string | null
          city: string | null
          competition_id: string | null
          created_at: string | null
          home: string
          home_id: string | null
          id: string
          is_derby: boolean | null
          kickoff_at: string
          league_id: string | null
          round: string | null
          round_id: string | null
          round_number: number | null
          score: Json | null
          search_tsv: unknown | null
          season_id: string | null
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
          away_id?: string | null
          city?: string | null
          competition_id?: string | null
          created_at?: string | null
          home: string
          home_id?: string | null
          id?: string
          is_derby?: boolean | null
          kickoff_at: string
          league_id?: string | null
          round?: string | null
          round_id?: string | null
          round_number?: number | null
          score?: Json | null
          search_tsv?: unknown | null
          season_id?: string | null
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
          away_id?: string | null
          city?: string | null
          competition_id?: string | null
          created_at?: string | null
          home?: string
          home_id?: string | null
          id?: string
          is_derby?: boolean | null
          kickoff_at?: string
          league_id?: string | null
          round?: string | null
          round_id?: string | null
          round_number?: number | null
          score?: Json | null
          search_tsv?: unknown | null
          season_id?: string | null
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
            foreignKeyName: "match_away_id_fkey"
            columns: ["away_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "round"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "season"
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
      metric_daily: {
        Row: {
          created_at: string | null
          day: string
          id: number
          labels: Json | null
          metric: string
          source: string
          value: number
        }
        Insert: {
          created_at?: string | null
          day: string
          id?: number
          labels?: Json | null
          metric: string
          source: string
          value: number
        }
        Update: {
          created_at?: string | null
          day?: string
          id?: number
          labels?: Json | null
          metric?: string
          source?: string
          value?: number
        }
        Relationships: []
      }
      movie: {
        Row: {
          backdrop_path: string | null
          backdrop_url: string | null
          certification: string | null
          cinema_release_ro: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          netflix_date: string | null
          original_title: string | null
          overview: string | null
          popularity: number | null
          poster_path: string | null
          poster_url: string | null
          prime_date: string | null
          provider: Json | null
          release_calendar: Json | null
          runtime: number | null
          search_tsv: unknown | null
          seo_description: string | null
          seo_h1: string | null
          seo_title: string | null
          slug: string | null
          source: Json | null
          status: string
          streaming_ro: Json | null
          title: string
          tmdb_id: number
          trailer_key: string | null
          trailer_youtube_key: string | null
          updated_at: string | null
          updated_ext_at: string | null
        }
        Insert: {
          backdrop_path?: string | null
          backdrop_url?: string | null
          certification?: string | null
          cinema_release_ro?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          netflix_date?: string | null
          original_title?: string | null
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          poster_url?: string | null
          prime_date?: string | null
          provider?: Json | null
          release_calendar?: Json | null
          runtime?: number | null
          search_tsv?: unknown | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          source?: Json | null
          status?: string
          streaming_ro?: Json | null
          title: string
          tmdb_id: number
          trailer_key?: string | null
          trailer_youtube_key?: string | null
          updated_at?: string | null
          updated_ext_at?: string | null
        }
        Update: {
          backdrop_path?: string | null
          backdrop_url?: string | null
          certification?: string | null
          cinema_release_ro?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          netflix_date?: string | null
          original_title?: string | null
          overview?: string | null
          popularity?: number | null
          poster_path?: string | null
          poster_url?: string | null
          prime_date?: string | null
          provider?: Json | null
          release_calendar?: Json | null
          runtime?: number | null
          search_tsv?: unknown | null
          seo_description?: string | null
          seo_h1?: string | null
          seo_title?: string | null
          slug?: string | null
          source?: Json | null
          status?: string
          streaming_ro?: Json | null
          title?: string
          tmdb_id?: number
          trailer_key?: string | null
          trailer_youtube_key?: string | null
          updated_at?: string | null
          updated_ext_at?: string | null
        }
        Relationships: []
      }
      movie_platform: {
        Row: {
          available_from: string | null
          created_at: string | null
          movie_id: string
          platform_id: string
          url: string | null
        }
        Insert: {
          available_from?: string | null
          created_at?: string | null
          movie_id: string
          platform_id: string
          url?: string | null
        }
        Update: {
          available_from?: string | null
          created_at?: string | null
          movie_id?: string
          platform_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movie_platform_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_platform_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "ott_platform"
            referencedColumns: ["id"]
          },
        ]
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
      ott_platform: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          handle: string | null
          ical_token: string | null
          id: string
          locale: string | null
          role: string
          theme_pref: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          handle?: string | null
          ical_token?: string | null
          id: string
          locale?: string | null
          role?: string
          theme_pref?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          handle?: string | null
          ical_token?: string | null
          id?: string
          locale?: string | null
          role?: string
          theme_pref?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limit: {
        Row: {
          created_at: string | null
          id: string
          ip_hash: string
          request_count: number | null
          route: string
          window_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_hash: string
          request_count?: number | null
          route: string
          window_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_hash?: string
          request_count?: number | null
          route?: string
          window_start?: string
        }
        Relationships: []
      }
      reminder: {
        Row: {
          channel: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          next_fire_at: string | null
          offset_days: number
          offset_hours: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          next_fire_at?: string | null
          offset_days: number
          offset_hours?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          next_fire_at?: string | null
          offset_days?: number
          offset_hours?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reminder_log: {
        Row: {
          id: number
          meta: Json | null
          outcome: string | null
          provider_id: string | null
          reminder_id: string | null
          sent_at: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          id?: number
          meta?: Json | null
          outcome?: string | null
          provider_id?: string | null
          reminder_id?: string | null
          sent_at?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          id?: number
          meta?: Json | null
          outcome?: string | null
          provider_id?: string | null
          reminder_id?: string | null
          sent_at?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reminder_queue: {
        Row: {
          created_at: string | null
          entity_id: string
          fire_at: string
          id: number
          kind: string
          last_error: string | null
          reminder_id: string
          status: string
          tries: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          fire_at: string
          id?: number
          kind: string
          last_error?: string | null
          reminder_id: string
          status?: string
          tries?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          fire_at?: string
          id?: number
          kind?: string
          last_error?: string | null
          reminder_id?: string
          status?: string
          tries?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_queue_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminder"
            referencedColumns: ["id"]
          },
        ]
      }
      round: {
        Row: {
          end_date: string | null
          id: string
          name: string | null
          number: number
          season_id: string
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          name?: string | null
          number: number
          season_id: string
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          name?: string | null
          number?: number
          season_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "round_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "season"
            referencedColumns: ["id"]
          },
        ]
      }
      school_calendar: {
        Row: {
          created_at: string | null
          ends_on: string
          id: string
          kind: string
          name: string
          official_ref: string | null
          school_year: string
          starts_on: string
        }
        Insert: {
          created_at?: string | null
          ends_on: string
          id?: string
          kind: string
          name: string
          official_ref?: string | null
          school_year: string
          starts_on: string
        }
        Update: {
          created_at?: string | null
          ends_on?: string
          id?: string
          kind?: string
          name?: string
          official_ref?: string | null
          school_year?: string
          starts_on?: string
        }
        Relationships: []
      }
      search_index: {
        Row: {
          category_slug: string | null
          entity_id: string | null
          genres: string[] | null
          id: string
          kind: string
          popularity: number | null
          search_text: string
          search_tsv: unknown | null
          slug: string | null
          subtitle: string | null
          title: string
          tv: string[] | null
          updated_at: string | null
          when_at: string | null
        }
        Insert: {
          category_slug?: string | null
          entity_id?: string | null
          genres?: string[] | null
          id?: string
          kind: string
          popularity?: number | null
          search_text: string
          search_tsv?: unknown | null
          slug?: string | null
          subtitle?: string | null
          title: string
          tv?: string[] | null
          updated_at?: string | null
          when_at?: string | null
        }
        Update: {
          category_slug?: string | null
          entity_id?: string | null
          genres?: string[] | null
          id?: string
          kind?: string
          popularity?: number | null
          search_text?: string
          search_tsv?: unknown | null
          slug?: string | null
          subtitle?: string | null
          title?: string
          tv?: string[] | null
          updated_at?: string | null
          when_at?: string | null
        }
        Relationships: []
      }
      search_synonym: {
        Row: {
          canonical: string
          created_at: string | null
          term: string
        }
        Insert: {
          canonical: string
          created_at?: string | null
          term: string
        }
        Update: {
          canonical?: string
          created_at?: string | null
          term?: string
        }
        Relationships: []
      }
      season: {
        Row: {
          end_date: string | null
          id: string
          is_current: boolean | null
          league_id: string
          phase: string
          start_date: string | null
          year_end: number
          year_start: number
        }
        Insert: {
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          league_id: string
          phase?: string
          start_date?: string | null
          year_end: number
          year_start: number
        }
        Update: {
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          league_id?: string
          phase?: string
          start_date?: string | null
          year_end?: number
          year_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "season_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["id"]
          },
        ]
      }
      security_event: {
        Row: {
          id: number
          ip_hash: string
          kind: string
          meta: Json | null
          occurred_at: string | null
          route: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: never
          ip_hash: string
          kind: string
          meta?: Json | null
          occurred_at?: string | null
          route: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: never
          ip_hash?: string
          kind?: string
          meta?: Json | null
          occurred_at?: string | null
          route?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_event_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
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
          build_locked: boolean | null
          build_min_interval_min: number | null
          build_reason: string | null
          build_status: string | null
          cache_version: number | null
          key: string
          last_build_at: string | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          build_locked?: boolean | null
          build_min_interval_min?: number | null
          build_reason?: string | null
          build_status?: string | null
          cache_version?: number | null
          key: string
          last_build_at?: string | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          build_locked?: boolean | null
          build_min_interval_min?: number | null
          build_reason?: string | null
          build_status?: string | null
          cache_version?: number | null
          key?: string
          last_build_at?: string | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      sitemap_chunk: {
        Row: {
          chunk_no: number
          id: number
          last_built_at: string | null
          section: string
          url_count: number
        }
        Insert: {
          chunk_no: number
          id?: number
          last_built_at?: string | null
          section: string
          url_count?: number
        }
        Update: {
          chunk_no?: number
          id?: number
          last_built_at?: string | null
          section?: string
          url_count?: number
        }
        Relationships: []
      }
      standings_live: {
        Row: {
          draws: number
          ga: number
          gf: number
          losses: number
          played: number
          points: number
          season_id: string
          team_name: string
          updated_at: string | null
          wins: number
        }
        Insert: {
          draws: number
          ga: number
          gf: number
          losses: number
          played: number
          points: number
          season_id: string
          team_name: string
          updated_at?: string | null
          wins: number
        }
        Update: {
          draws?: number
          ga?: number
          gf?: number
          losses?: number
          played?: number
          points?: number
          season_id?: string
          team_name?: string
          updated_at?: string | null
          wins?: number
        }
        Relationships: []
      }
      tag: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team: {
        Row: {
          active: boolean | null
          city: string | null
          colors: Json | null
          country: string | null
          created_at: string | null
          founded_year: number | null
          id: string
          name: string
          short_name: string | null
          slug: string
          stadium: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          city?: string | null
          colors?: Json | null
          country?: string | null
          created_at?: string | null
          founded_year?: number | null
          id?: string
          name: string
          short_name?: string | null
          slug: string
          stadium?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          city?: string | null
          colors?: Json | null
          country?: string | null
          created_at?: string | null
          founded_year?: number | null
          id?: string
          name?: string
          short_name?: string | null
          slug?: string
          stadium?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      team_alias: {
        Row: {
          alias: string
          canonical: string
          created_at: string
          team_id: string | null
        }
        Insert: {
          alias: string
          canonical: string
          created_at?: string
          team_id?: string | null
        }
        Update: {
          alias?: string
          canonical?: string
          created_at?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_alias_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      tiebreak_rule: {
        Row: {
          league_id: string
          rules: Json
        }
        Insert: {
          league_id: string
          rules?: Json
        }
        Update: {
          league_id?: string
          rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tiebreak_rule_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: true
            referencedRelation: "league"
            referencedColumns: ["id"]
          },
        ]
      }
      top_pages_daily: {
        Row: {
          day: string
          pageviews: number
          path: string
          visitors: number
        }
        Insert: {
          day: string
          pageviews: number
          path: string
          visitors: number
        }
        Update: {
          day?: string
          pageviews?: number
          path?: string
          visitors?: number
        }
        Relationships: []
      }
      trending: {
        Row: {
          entity_id: string
          kind: string
          reasons: Json
          score: number
          updated_at: string | null
        }
        Insert: {
          entity_id: string
          kind: string
          reasons?: Json
          score: number
          updated_at?: string | null
        }
        Update: {
          entity_id?: string
          kind?: string
          reasons?: Json
          score?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      tv_channel: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner: string | null
          priority: number | null
          slug: string
          website: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner?: string | null
          priority?: number | null
          slug: string
          website?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner?: string | null
          priority?: number | null
          slug?: string
          website?: string | null
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
      tv_program: {
        Row: {
          channel_id: string
          city: string | null
          competition: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          kind: string
          match_id: string | null
          source: string
          starts_at: string
          status: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          city?: string | null
          competition?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          match_id?: string | null
          source?: string
          starts_at: string
          status?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          city?: string | null
          competition?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          match_id?: string | null
          source?: string
          starts_at?: string
          status?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tv_program_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "tv_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_program_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match"
            referencedColumns: ["id"]
          },
        ]
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
      url_change_log: {
        Row: {
          created_at: string | null
          entity_id: string | null
          id: number
          kind: string
          reason: string
          url: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          id?: number
          kind: string
          reason: string
          url: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          id?: number
          kind?: string
          reason?: string
          url?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_digest: boolean | null
          email_reminders: boolean | null
          marketing_emails: boolean | null
          pushes: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_digest?: boolean | null
          email_reminders?: boolean | null
          marketing_emails?: boolean | null
          pushes?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_digest?: boolean | null
          email_reminders?: boolean | null
          marketing_emails?: boolean | null
          pushes?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      venue: {
        Row: {
          address: string | null
          city_id: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      standings_regular: {
        Row: {
          draws: number | null
          ga: number | null
          gf: number | null
          losses: number | null
          played: number | null
          points: number | null
          season_id: string | null
          team_name: string | null
          wins: number | null
        }
        Relationships: []
      }
      static_pages: {
        Row: {
          url: string | null
        }
        Relationships: []
      }
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
      cleanup_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      compute_event_seo: {
        Args: { e: Database["public"]["Tables"]["event"]["Row"] }
        Returns: {
          category_id: string | null
          city: string | null
          city_id: string | null
          country: string | null
          created_at: string | null
          curated: boolean | null
          description: string | null
          editorial_status: string | null
          end_at: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_recurring: boolean | null
          location_city: string | null
          moderation_notes: string | null
          moderator_id: string | null
          official_site: string | null
          official_source_url: string | null
          official_url: string | null
          og_theme: string | null
          rrule: string | null
          search_tsv: unknown | null
          seo_description: string | null
          seo_faq: Json | null
          seo_h1: string | null
          seo_title: string | null
          slug: string
          start_at: string
          starts_at: string | null
          status: string
          submitted_by: string | null
          subtitle: string | null
          tickets_affiliate_link_id: string | null
          timezone: string
          title: string
          updated_at: string | null
          venue_id: string | null
          verified_at: string | null
        }
      }
      compute_match_seo: {
        Args: { m: Database["public"]["Tables"]["match"]["Row"] }
        Returns: {
          away: string
          away_id: string | null
          city: string | null
          competition_id: string | null
          created_at: string | null
          home: string
          home_id: string | null
          id: string
          is_derby: boolean | null
          kickoff_at: string
          league_id: string | null
          round: string | null
          round_id: string | null
          round_number: number | null
          score: Json | null
          search_tsv: unknown | null
          season_id: string | null
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
          backdrop_path: string | null
          backdrop_url: string | null
          certification: string | null
          cinema_release_ro: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          netflix_date: string | null
          original_title: string | null
          overview: string | null
          popularity: number | null
          poster_path: string | null
          poster_url: string | null
          prime_date: string | null
          provider: Json | null
          release_calendar: Json | null
          runtime: number | null
          search_tsv: unknown | null
          seo_description: string | null
          seo_h1: string | null
          seo_title: string | null
          slug: string | null
          source: Json | null
          status: string
          streaming_ro: Json | null
          title: string
          tmdb_id: number
          trailer_key: string | null
          trailer_youtube_key: string | null
          updated_at: string | null
          updated_ext_at: string | null
        }
      }
      count_rate_limit: {
        Args: { route_in: string; ip_hash_in: string; since_in: string }
        Returns: number
      }
      current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_movie_next_date: {
        Args: { movie_row: Database["public"]["Tables"]["movie"]["Row"] }
        Returns: Json
      }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          id: string
          display_name: string
          avatar_url: string
          handle: string
          created_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_ip_allowlisted: {
        Args: { ip_address: unknown }
        Returns: boolean
      }
      is_ip_blocked: {
        Args: { ip_address: unknown }
        Returns: boolean
      }
      normalize_text: {
        Args: { input: string }
        Returns: string
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
      unaccent: {
        Args: { "": string }
        Returns: string
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
