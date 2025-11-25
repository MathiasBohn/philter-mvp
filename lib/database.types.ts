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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          application_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          application_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          application_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      address_history: {
        Row: {
          address: Json
          created_at: string
          id: string
          is_current: boolean
          landlord_email: string | null
          landlord_name: string | null
          landlord_phone: string | null
          monthly_rent: number | null
          move_in_date: string
          move_out_date: string | null
          person_id: string
          updated_at: string
        }
        Insert: {
          address: Json
          created_at?: string
          id?: string
          is_current?: boolean
          landlord_email?: string | null
          landlord_name?: string | null
          landlord_phone?: string | null
          monthly_rent?: number | null
          move_in_date: string
          move_out_date?: string | null
          person_id: string
          updated_at?: string
        }
        Update: {
          address?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          landlord_email?: string | null
          landlord_name?: string | null
          landlord_phone?: string | null
          monthly_rent?: number | null
          move_in_date?: string
          move_out_date?: string | null
          person_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      application_invitations: {
        Row: {
          accepted_at: string | null
          application_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: Database["public"]["Enums"]["invitation_status_enum"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          application_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: Database["public"]["Enums"]["invitation_status_enum"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          application_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: Database["public"]["Enums"]["invitation_status_enum"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_invitations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_participants: {
        Row: {
          accepted_at: string | null
          application_id: string
          created_at: string
          id: string
          invited_at: string | null
          role: Database["public"]["Enums"]["role_enum"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          application_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          role: Database["public"]["Enums"]["role_enum"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          application_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_participants_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          broker_owned: boolean
          building_id: string | null
          completion_percentage: number
          created_at: string
          created_by: string
          current_section: string | null
          deleted_at: string | null
          id: string
          is_locked: boolean
          metadata: Json | null
          primary_applicant_email: string | null
          primary_applicant_id: string | null
          search_vector: unknown
          status: Database["public"]["Enums"]["application_status_enum"]
          submitted_at: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          unit: string | null
          updated_at: string
        }
        Insert: {
          broker_owned?: boolean
          building_id?: string | null
          completion_percentage?: number
          created_at?: string
          created_by: string
          current_section?: string | null
          deleted_at?: string | null
          id?: string
          is_locked?: boolean
          metadata?: Json | null
          primary_applicant_email?: string | null
          primary_applicant_id?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["application_status_enum"]
          submitted_at?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          unit?: string | null
          updated_at?: string
        }
        Update: {
          broker_owned?: boolean
          building_id?: string | null
          completion_percentage?: number
          created_at?: string
          created_by?: string
          current_section?: string | null
          deleted_at?: string | null
          id?: string
          is_locked?: boolean
          metadata?: Json | null
          primary_applicant_email?: string | null
          primary_applicant_id?: string | null
          search_vector?: unknown
          status?: Database["public"]["Enums"]["application_status_enum"]
          submitted_at?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type_enum"]
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      board_assignments: {
        Row: {
          application_id: string
          assigned_at: string
          assigned_by: string | null
          board_member_id: string
          created_at: string
          id: string
        }
        Insert: {
          application_id: string
          assigned_at?: string
          assigned_by?: string | null
          board_member_id: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          assigned_at?: string
          assigned_by?: string | null
          board_member_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      board_notes: {
        Row: {
          application_id: string
          board_member_id: string
          created_at: string
          deleted_at: string | null
          id: string
          note: string
          updated_at: string
        }
        Insert: {
          application_id: string
          board_member_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          note: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          board_member_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          address: Json
          building_type: Database["public"]["Enums"]["building_type_enum"]
          code: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          policies: Json | null
          updated_at: string
        }
        Insert: {
          address: Json
          building_type: Database["public"]["Enums"]["building_type_enum"]
          code: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          policies?: Json | null
          updated_at?: string
        }
        Update: {
          address?: Json
          building_type?: Database["public"]["Enums"]["building_type_enum"]
          code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          policies?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      decision_records: {
        Row: {
          adverse_action_required: boolean
          adverse_action_sent_at: string | null
          application_id: string
          conditions: string | null
          created_at: string
          decided_at: string
          decided_by: string
          decision: Database["public"]["Enums"]["decision_enum"]
          id: string
          notes: string | null
          reason_codes: Json | null
          uses_consumer_report: boolean
        }
        Insert: {
          adverse_action_required?: boolean
          adverse_action_sent_at?: string | null
          application_id: string
          conditions?: string | null
          created_at?: string
          decided_at?: string
          decided_by: string
          decision: Database["public"]["Enums"]["decision_enum"]
          id?: string
          notes?: string | null
          reason_codes?: Json | null
          uses_consumer_report?: boolean
        }
        Update: {
          adverse_action_required?: boolean
          adverse_action_sent_at?: string | null
          application_id?: string
          conditions?: string | null
          created_at?: string
          decided_at?: string
          decided_by?: string
          decision?: Database["public"]["Enums"]["decision_enum"]
          id?: string
          notes?: string | null
          reason_codes?: Json | null
          uses_consumer_report?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "decision_records_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      disclosures: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          application_id: string
          created_at: string
          disclosure_type: Database["public"]["Enums"]["disclosure_type_enum"]
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          application_id: string
          created_at?: string
          disclosure_type: Database["public"]["Enums"]["disclosure_type_enum"]
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          application_id?: string
          created_at?: string
          disclosure_type?: Database["public"]["Enums"]["disclosure_type_enum"]
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disclosures_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          application_id: string
          category: Database["public"]["Enums"]["document_category_enum"]
          created_at: string
          deleted_at: string | null
          filename: string
          id: string
          mime_type: string
          size: number
          status: Database["public"]["Enums"]["document_status_enum"]
          storage_path: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          application_id: string
          category: Database["public"]["Enums"]["document_category_enum"]
          created_at?: string
          deleted_at?: string | null
          filename: string
          id?: string
          mime_type: string
          size: number
          status?: Database["public"]["Enums"]["document_status_enum"]
          storage_path: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          application_id?: string
          category?: Database["public"]["Enums"]["document_category_enum"]
          created_at?: string
          deleted_at?: string | null
          filename?: string
          id?: string
          mime_type?: string
          size?: number
          status?: Database["public"]["Enums"]["document_status_enum"]
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          person_id: string
          phone: string
          relationship: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          person_id: string
          phone: string
          relationship: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          person_id?: string
          phone?: string
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_records: {
        Row: {
          address: Json | null
          annual_income: number | null
          application_id: string
          created_at: string
          employer_name: string
          employment_status: Database["public"]["Enums"]["employment_status_enum"]
          end_date: string | null
          id: string
          is_current: boolean
          job_title: string | null
          pay_cadence: Database["public"]["Enums"]["pay_cadence_enum"] | null
          person_id: string | null
          start_date: string
          supervisor_email: string | null
          supervisor_name: string | null
          supervisor_phone: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          annual_income?: number | null
          application_id: string
          created_at?: string
          employer_name: string
          employment_status: Database["public"]["Enums"]["employment_status_enum"]
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title?: string | null
          pay_cadence?: Database["public"]["Enums"]["pay_cadence_enum"] | null
          person_id?: string | null
          start_date: string
          supervisor_email?: string | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          annual_income?: number | null
          application_id?: string
          created_at?: string
          employer_name?: string
          employment_status?: Database["public"]["Enums"]["employment_status_enum"]
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title?: string | null
          pay_cadence?: Database["public"]["Enums"]["pay_cadence_enum"] | null
          person_id?: string | null
          start_date?: string
          supervisor_email?: string | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employment_records_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employment_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          account_number_last4: string | null
          amount: number
          application_id: string
          category: string
          created_at: string
          description: string | null
          entry_type: Database["public"]["Enums"]["financial_entry_type_enum"]
          id: string
          institution: string | null
          is_liquid: boolean | null
          monthly_payment: number | null
          updated_at: string
        }
        Insert: {
          account_number_last4?: string | null
          amount: number
          application_id: string
          category: string
          created_at?: string
          description?: string | null
          entry_type: Database["public"]["Enums"]["financial_entry_type_enum"]
          id?: string
          institution?: string | null
          is_liquid?: boolean | null
          monthly_payment?: number | null
          updated_at?: string
        }
        Update: {
          account_number_last4?: string | null
          amount?: number
          application_id?: string
          category?: string
          created_at?: string
          description?: string | null
          entry_type?: Database["public"]["Enums"]["financial_entry_type_enum"]
          id?: string
          institution?: string | null
          is_liquid?: boolean | null
          monthly_payment?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          read: boolean
          read_at: string | null
          rfi_id: string | null
          title: string
          triggered_by: string | null
          type: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          rfi_id?: string | null
          title: string
          triggered_by?: string | null
          type: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          rfi_id?: string | null
          title?: string
          triggered_by?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_rfi_id_fkey"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "rfis"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          application_id: string
          created_at: string
          current_address: Json | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["role_enum"]
          ssn_encrypted: string | null
          ssn_last4: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          current_address?: Json | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          role: Database["public"]["Enums"]["role_enum"]
          ssn_encrypted?: string | null
          ssn_last4?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          current_address?: Json | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          ssn_encrypted?: string | null
          ssn_last4?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_properties: {
        Row: {
          address: Json
          application_id: string
          created_at: string
          current_value: number | null
          id: string
          is_primary_residence: boolean | null
          is_rental: boolean | null
          monthly_payment: number | null
          monthly_rental_income: number | null
          mortgage_balance: number | null
          property_type: Database["public"]["Enums"]["property_type_enum"]
          purchase_date: string | null
          purchase_price: number | null
          updated_at: string
        }
        Insert: {
          address: Json
          application_id: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_primary_residence?: boolean | null
          is_rental?: boolean | null
          monthly_payment?: number | null
          monthly_rental_income?: number | null
          mortgage_balance?: number | null
          property_type: Database["public"]["Enums"]["property_type_enum"]
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string
        }
        Update: {
          address?: Json
          application_id?: string
          created_at?: string
          current_value?: number | null
          id?: string
          is_primary_residence?: boolean | null
          is_rental?: boolean | null
          monthly_payment?: number | null
          monthly_rental_income?: number | null
          mortgage_balance?: number | null
          property_type?: Database["public"]["Enums"]["property_type_enum"]
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_estate_properties_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_messages: {
        Row: {
          attachments: Json | null
          author_id: string
          author_name: string
          author_role: Database["public"]["Enums"]["role_enum"]
          created_at: string
          id: string
          message: string
          rfi_id: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          author_name: string
          author_role: Database["public"]["Enums"]["role_enum"]
          created_at?: string
          id?: string
          message: string
          rfi_id: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          author_name?: string
          author_role?: Database["public"]["Enums"]["role_enum"]
          created_at?: string
          id?: string
          message?: string
          rfi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfi_messages_rfi_id_fkey"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "rfis"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
          application_id: string
          assignee_role: Database["public"]["Enums"]["role_enum"]
          created_at: string
          created_by: string
          id: string
          resolved_at: string | null
          section_key: string | null
          status: Database["public"]["Enums"]["rfi_status_enum"]
          updated_at: string
        }
        Insert: {
          application_id: string
          assignee_role: Database["public"]["Enums"]["role_enum"]
          created_at?: string
          created_by: string
          id?: string
          resolved_at?: string | null
          section_key?: string | null
          status?: Database["public"]["Enums"]["rfi_status_enum"]
          updated_at?: string
        }
        Update: {
          application_id?: string
          assignee_role?: Database["public"]["Enums"]["role_enum"]
          created_at?: string
          created_by?: string
          id?: string
          resolved_at?: string | null
          section_key?: string | null
          status?: Database["public"]["Enums"]["rfi_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfis_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          building_id: string
          created_at: string
          custom_disclosures: Json
          id: string
          is_published: boolean
          name: string
          required_documents: Json
          sections: Json
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          custom_disclosures?: Json
          id?: string
          is_published?: boolean
          name: string
          required_documents?: Json
          sections?: Json
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          custom_disclosures?: Json
          id?: string
          is_published?: boolean
          name?: string
          required_documents?: Json
          sections?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          consent_accepted_at: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          first_name: string
          id: string
          ip_address: unknown
          last_name: string
          notification_preferences: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["role_enum"]
          updated_at: string
        }
        Insert: {
          consent_accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          first_name: string
          id: string
          ip_address?: unknown
          last_name: string
          notification_preferences?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          updated_at?: string
        }
        Update: {
          consent_accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          ip_address?: unknown
          last_name?: string
          notification_preferences?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_submit_application: { Args: { app_id: string }; Returns: boolean }
      create_document_metadata: {
        Args: {
          p_application_id: string
          p_category: string
          p_filename: string
          p_mime_type: string
          p_size: number
          p_storage_path: string
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_application_id?: string
          p_link?: string
          p_message?: string
          p_metadata?: Json
          p_rfi_id?: string
          p_title: string
          p_triggered_by?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_rfi_with_message: {
        Args: {
          p_application_id: string
          p_assignee_role?: string
          p_message: string
          p_section_key: string
        }
        Returns: Json
      }
      delete_document: { Args: { p_document_id: string }; Returns: Json }
      expire_old_invitations: { Args: never; Returns: undefined }
      get_application_completion_percentage: {
        Args: { app_id: string }
        Returns: number
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["role_enum"]
      }
      is_application_complete: { Args: { app_id: string }; Returns: boolean }
      is_application_creator: {
        Args: { app_id: string; user_id: string }
        Returns: boolean
      }
      is_application_participant: {
        Args: { app_id: string; user_id: string }
        Returns: boolean
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      record_application_decision: {
        Args: {
          p_application_id: string
          p_conditions?: string
          p_decision: string
          p_notes?: string
          p_reason_codes?: Json
          p_uses_consumer_report?: boolean
        }
        Returns: Json
      }
      submit_application: { Args: { p_application_id: string }; Returns: Json }
      update_financial_entries: {
        Args: { p_application_id: string; p_entries: Json }
        Returns: Json
      }
    }
    Enums: {
      application_status_enum:
        | "IN_PROGRESS"
        | "SUBMITTED"
        | "IN_REVIEW"
        | "RFI"
        | "APPROVED"
        | "CONDITIONAL"
        | "DENIED"
      asset_category_enum:
        | "CHECKING"
        | "SAVINGS"
        | "STOCKS"
        | "BONDS"
        | "RETIREMENT"
        | "REAL_ESTATE"
        | "OTHER"
      building_type_enum: "RENTAL" | "COOP" | "CONDO"
      decision_enum: "APPROVE" | "CONDITIONAL" | "DENY"
      disclosure_type_enum:
        | "LEAD_PAINT"
        | "LOCAL_LAW_144"
        | "LOCAL_LAW_97"
        | "FCRA_AUTHORIZATION"
        | "BACKGROUND_CHECK_CONSENT"
        | "CREDIT_CHECK_AUTHORIZATION"
        | "TERMS_OF_SERVICE"
        | "PRIVACY_POLICY"
        | "SUBLET_DISCLOSURE"
        | "TENANT_DISCLOSURE"
        | "PET_POLICY"
        | "SMOKING_POLICY"
        | "RENOVATION_POLICY"
        | "OTHER"
      document_category_enum:
        | "GOVERNMENT_ID"
        | "BANK_STATEMENT"
        | "TAX_RETURN"
        | "PAY_STUB"
        | "EMPLOYMENT_LETTER"
        | "REFERENCE_LETTER"
        | "OTHER_FINANCIAL"
        | "OTHER"
      document_status_enum: "UPLOADING" | "PROCESSING" | "COMPLETE" | "ERROR"
      employment_status_enum:
        | "FULL_TIME"
        | "PART_TIME"
        | "CONTRACT"
        | "SELF_EMPLOYED"
        | "UNEMPLOYED"
        | "RETIRED"
      expense_category_enum:
        | "RENT"
        | "MORTGAGE"
        | "UTILITIES"
        | "INSURANCE"
        | "CAR_PAYMENT"
        | "STUDENT_LOAN"
        | "CREDIT_CARD"
        | "OTHER"
      financial_entry_type_enum: "ASSET" | "LIABILITY" | "INCOME" | "EXPENSE"
      income_category_enum:
        | "SALARY"
        | "BONUS"
        | "INVESTMENT"
        | "RENTAL"
        | "BUSINESS"
        | "OTHER"
      invitation_status_enum: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
      liability_category_enum:
        | "MORTGAGE"
        | "AUTO_LOAN"
        | "STUDENT_LOAN"
        | "CREDIT_CARD"
        | "PERSONAL_LOAN"
        | "OTHER"
      notification_type_enum:
        | "APPLICATION_SUBMITTED"
        | "RFI_CREATED"
        | "RFI_MESSAGE"
        | "RFI_RESOLVED"
        | "DECISION_MADE"
        | "DOCUMENT_UPLOADED"
        | "APPLICATION_STATUS_CHANGED"
        | "INVITATION_RECEIVED"
        | "INVITATION_ACCEPTED"
        | "SYSTEM_ANNOUNCEMENT"
      pay_cadence_enum:
        | "HOURLY"
        | "WEEKLY"
        | "BI_WEEKLY"
        | "SEMI_MONTHLY"
        | "MONTHLY"
        | "ANNUALLY"
      property_type_enum:
        | "SINGLE_FAMILY"
        | "CONDO"
        | "COOP"
        | "MULTI_FAMILY"
        | "COMMERCIAL"
        | "OTHER"
      rfi_status_enum: "OPEN" | "RESOLVED"
      role_enum:
        | "APPLICANT"
        | "CO_APPLICANT"
        | "GUARANTOR"
        | "BROKER"
        | "ADMIN"
        | "BOARD"
        | "TRANSACTION_AGENT"
        | "PROPERTY_MANAGER"
        | "BUILDING_MANAGER"
        | "ATTORNEY"
        | "ACCOUNTANT"
        | "REFERENCE"
        | "LANDLORD"
      transaction_type_enum:
        | "COOP_PURCHASE"
        | "CONDO_PURCHASE"
        | "COOP_SUBLET"
        | "CONDO_LEASE"
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
