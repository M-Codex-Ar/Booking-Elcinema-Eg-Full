export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      managed_boxoffice: {
        Row: {
          created_at: string;
          id: string;
          note: string;
          title_ar: string;
          title_en: string;
          total_egp: number;
          updated_at: string;
          weekly_egp: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string;
          title_ar?: string;
          title_en: string;
          total_egp?: number;
          updated_at?: string;
          weekly_egp?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string;
          title_ar?: string;
          title_en?: string;
          total_egp?: number;
          updated_at?: string;
          weekly_egp?: number;
        };
        Relationships: [];
      };
      managed_channels: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          logo_url: string | null;
          name_ar: string;
          name_en: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name_ar?: string;
          name_en: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name_ar?: string;
          name_en?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      managed_lists: {
        Row: {
          created_at: string;
          id: string;
          items: Json;
          title_ar: string;
          title_en: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          items?: Json;
          title_ar?: string;
          title_en: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          items?: Json;
          title_ar?: string;
          title_en?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      managed_movies: {
        Row: {
          cert: string;
          created_at: string;
          director_ar: string;
          director_en: string;
          genre: string;
          id: string;
          poster_url: string | null;
          rating: number | null;
          release_date: string | null;
          runtime: number;
          status: string;
          synopsis_ar: string;
          synopsis_en: string;
          title_ar: string;
          title_en: string;
          updated_at: string;
          year: number | null;
        };
        Insert: {
          cert?: string;
          created_at?: string;
          director_ar?: string;
          director_en?: string;
          genre?: string;
          id?: string;
          poster_url?: string | null;
          rating?: number | null;
          release_date?: string | null;
          runtime?: number;
          status?: string;
          synopsis_ar?: string;
          synopsis_en?: string;
          title_ar?: string;
          title_en: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          cert?: string;
          created_at?: string;
          director_ar?: string;
          director_en?: string;
          genre?: string;
          id?: string;
          poster_url?: string | null;
          rating?: number | null;
          release_date?: string | null;
          runtime?: number;
          status?: string;
          synopsis_ar?: string;
          synopsis_en?: string;
          title_ar?: string;
          title_en?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [];
      };
      managed_people: {
        Row: {
          bio: string;
          created_at: string;
          id: string;
          name_ar: string;
          name_en: string;
          photo_url: string | null;
          role_ar: string;
          role_en: string;
          updated_at: string;
        };
        Insert: {
          bio?: string;
          created_at?: string;
          id?: string;
          name_ar?: string;
          name_en: string;
          photo_url?: string | null;
          role_ar?: string;
          role_en?: string;
          updated_at?: string;
        };
        Update: {
          bio?: string;
          created_at?: string;
          id?: string;
          name_ar?: string;
          name_en?: string;
          photo_url?: string | null;
          role_ar?: string;
          role_en?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      managed_programs: {
        Row: {
          channel_id: string;
          created_at: string;
          end_min: number;
          id: string;
          meta: string;
          start_min: number;
          title_ar: string;
          title_en: string;
          updated_at: string;
        };
        Insert: {
          channel_id: string;
          created_at?: string;
          end_min: number;
          id?: string;
          meta?: string;
          start_min: number;
          title_ar?: string;
          title_en: string;
          updated_at?: string;
        };
        Update: {
          channel_id?: string;
          created_at?: string;
          end_min?: number;
          id?: string;
          meta?: string;
          start_min?: number;
          title_ar?: string;
          title_en?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "managed_programs_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "managed_channels";
            referencedColumns: ["id"];
          },
        ];
      };
      managed_videos: {
        Row: {
          created_at: string;
          duration: string;
          id: string;
          thumb_url: string | null;
          title_ar: string;
          title_en: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          duration?: string;
          id?: string;
          thumb_url?: string | null;
          title_ar?: string;
          title_en: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          duration?: string;
          id?: string;
          thumb_url?: string | null;
          title_ar?: string;
          title_en?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
