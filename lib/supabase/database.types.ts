// Generado desde el proyecto TheProKnow con generate_typescript_types.
// Regenerar tras cada migración:  npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          is_accepted: boolean;
          parent_id: string | null;
          post_id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          is_accepted?: boolean;
          parent_id?: string | null;
          post_id: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          is_accepted?: boolean;
          parent_id?: string | null;
          post_id?: string;
        };
        Relationships: [
          { foreignKeyName: "comments_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "comments_parent_id_fkey"; columns: ["parent_id"]; isOneToOne: false; referencedRelation: "comments"; referencedColumns: ["id"] },
          { foreignKeyName: "comments_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
        ];
      };
      communities: {
        Row: { description: string | null; icon: string; id: string; is_active: boolean; name: string; slug: string };
        Insert: { description?: string | null; icon?: string; id?: string; is_active?: boolean; name: string; slug: string };
        Update: { description?: string | null; icon?: string; id?: string; is_active?: boolean; name?: string; slug?: string };
        Relationships: [];
      };
      community_members: {
        Row: { community_id: string; created_at: string; user_id: string };
        Insert: { community_id: string; created_at?: string; user_id: string };
        Update: { community_id?: string; created_at?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "community_members_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "community_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      follows: {
        Row: { created_at: string; follower_id: string; following_id: string };
        Insert: { created_at?: string; follower_id: string; following_id: string };
        Update: { created_at?: string; follower_id?: string; following_id?: string };
        Relationships: [
          { foreignKeyName: "follows_follower_id_fkey"; columns: ["follower_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "follows_following_id_fkey"; columns: ["following_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      helpful_marks: {
        Row: { created_at: string; post_id: string; user_id: string };
        Insert: { created_at?: string; post_id: string; user_id: string };
        Update: { created_at?: string; post_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "helpful_marks_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "helpful_marks_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      likes: {
        Row: { created_at: string; post_id: string; user_id: string };
        Insert: { created_at?: string; post_id: string; user_id: string };
        Update: { created_at?: string; post_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "likes_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "likes_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      notifications: {
        Row: {
          actor_id: string;
          comment_id: string | null;
          created_at: string;
          id: string;
          post_id: string | null;
          read: boolean;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          actor_id: string;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          read?: boolean;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          actor_id?: string;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          read?: boolean;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [
          { foreignKeyName: "notifications_actor_id_fkey"; columns: ["actor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "notifications_comment_id_fkey"; columns: ["comment_id"]; isOneToOne: false; referencedRelation: "comments"; referencedColumns: ["id"] },
          { foreignKeyName: "notifications_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      posts: {
        Row: {
          author_id: string;
          body: string;
          comment_count: number;
          community_id: string;
          cover_url: string | null;
          created_at: string;
          helpful_count: number;
          hidden: boolean;
          id: string;
          like_count: number;
          save_count: number;
          title: string;
          type: Database["public"]["Enums"]["post_type"];
          video_url: string | null;
        };
        Insert: {
          author_id: string;
          body: string;
          comment_count?: number;
          community_id: string;
          cover_url?: string | null;
          created_at?: string;
          helpful_count?: number;
          hidden?: boolean;
          id?: string;
          like_count?: number;
          save_count?: number;
          title: string;
          type: Database["public"]["Enums"]["post_type"];
          video_url?: string | null;
        };
        Update: {
          author_id?: string;
          body?: string;
          comment_count?: number;
          community_id?: string;
          cover_url?: string | null;
          created_at?: string;
          helpful_count?: number;
          hidden?: boolean;
          id?: string;
          like_count?: number;
          save_count?: number;
          title?: string;
          type?: Database["public"]["Enums"]["post_type"];
          video_url?: string | null;
        };
        Relationships: [
          { foreignKeyName: "posts_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "posts_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string;
          id: string;
          is_verified: boolean;
          reputation: number;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          is_verified?: boolean;
          reputation?: number;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          is_verified?: boolean;
          reputation?: number;
          username?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: { comment_id: string | null; created_at: string; id: string; post_id: string | null; reason: string; reporter_id: string };
        Insert: { comment_id?: string | null; created_at?: string; id?: string; post_id?: string | null; reason: string; reporter_id: string };
        Update: { comment_id?: string | null; created_at?: string; id?: string; post_id?: string | null; reason?: string; reporter_id?: string };
        Relationships: [
          { foreignKeyName: "reports_comment_id_fkey"; columns: ["comment_id"]; isOneToOne: false; referencedRelation: "comments"; referencedColumns: ["id"] },
          { foreignKeyName: "reports_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "reports_reporter_id_fkey"; columns: ["reporter_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      saves: {
        Row: { created_at: string; post_id: string; user_id: string };
        Insert: { created_at?: string; post_id: string; user_id: string };
        Update: { created_at?: string; post_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "saves_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "saves_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_reputation: { Args: { delta: number; uid: string }; Returns: undefined };
      reputation_level: {
        Args: { points: number };
        Returns: { level: number; name: string; next_level_at: number; progress: number }[];
      };
      toggle_accepted_answer: { Args: { p_comment_id: string }; Returns: boolean };
    };
    Enums: {
      notification_type: "like" | "helpful" | "comment" | "reply" | "accepted" | "follow";
      post_type: "consejo" | "pregunta" | "tutorial" | "articulo";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
