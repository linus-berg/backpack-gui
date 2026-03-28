export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Optional because only present on initial creation
  key_preview: string;
  created_at: string;
  created_by: string;
}
