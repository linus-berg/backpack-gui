export interface AuxField {
  key: string;
  type: string;
  name: string;
  placeholder: string;
  /** Value pre-filled when adding an artifact. */
  default?: string | null;
}
