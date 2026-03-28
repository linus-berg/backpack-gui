export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Optional because only present on initial creation
  key_preview: string;
  is_admin: boolean;
  created_at: string;
  created_by: string;
}
