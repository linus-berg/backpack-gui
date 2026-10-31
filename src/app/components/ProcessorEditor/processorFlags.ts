import { Processor } from 'types/Processor';

export type ProcessorFlag =
  | 'direct_collect'
  | 'requires_approval'
  | 'multi_add'
  | 'is_external'
  | 'preview_enabled';

interface FlagMeta {
  key: ProcessorFlag;
  label: string;
  help: string;
  /** Whether the flag can be set when creating a processor (the API's add endpoint doesn't accept every flag). */
  onCreate: boolean;
}

/** Processor switches with their labels and explanations, shared by the add dialog and the editor. */
export const PROCESSOR_FLAGS: FlagMeta[] = [
  {
    key: 'requires_approval',
    label: 'Requires approval',
    help: 'New artifacts must be approved by an administrator before they are mirrored.',
    onCreate: true,
  },
  {
    key: 'preview_enabled',
    label: 'Enable preview',
    help: 'Shows a Preview button so users can query the upstream registry before adding an artifact.',
    onCreate: true,
  },
  {
    key: 'multi_add',
    label: 'Enable bulk add',
    help: 'Shows a Bulk add button for adding many artifacts from a text list.',
    onCreate: true,
  },
  {
    key: 'is_external',
    label: 'Managed externally',
    help: 'Backpack only tracks artifact IDs. No background collection or processing is done.',
    onCreate: true,
  },
  {
    key: 'direct_collect',
    label: 'Direct collect',
    help: 'The collector fetches artifacts directly by ID instead of crawling the registry for versions and dependencies.',
    onCreate: false,
  },
];

export type ProcessorFlags = Pick<Processor, ProcessorFlag>;
