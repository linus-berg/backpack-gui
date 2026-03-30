export interface Processor {
  id: string;
  config: string;
  description: string;
  direct_collect: boolean;
  requires_approval: boolean;
  multi_add: boolean;
  is_external: boolean;
  preview_enabled: boolean;
}
