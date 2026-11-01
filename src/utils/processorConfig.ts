import { AuxDict } from 'types/AuxDict';
import { AuxField } from 'types/AuxField';

const SUPPORTED_TYPES = ['string', 'bool'];

/**
 * Parses a processor's auxiliary field definitions without throwing.
 * @param config The JSON string stored on the processor.
 * @returns The field dictionary; empty when the JSON is missing or malformed.
 */
export const parseAuxConfig = (config: string | null | undefined): AuxDict => {
  if (!config) {
    return {};
  }
  try {
    const parsed = JSON.parse(config);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as AuxDict)
      : {};
  } catch {
    return {};
  }
};

/**
 * @param aux Field definitions for a processor.
 * @returns Fields in display order, keyed by their config key.
 */
export const auxFieldList = (aux: AuxDict): AuxField[] => Object.values(aux);

/**
 * @param aux Field definitions for a processor.
 * @returns Initial config values for the add-artifact form.
 */
export const auxDefaults = (aux: AuxDict): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const field of auxFieldList(aux)) {
    if (field.default !== undefined && field.default !== null) {
      values[field.key] = String(field.default);
    } else if (field.type?.toLowerCase() === 'bool') {
      values[field.key] = 'false';
    }
  }
  return values;
};

/**
 * @param aux Field definitions for a processor.
 * @param key A config key.
 * @returns The human-readable name for the key, falling back to the key.
 */
export const auxFieldName = (aux: AuxDict, key: string): string =>
  auxFieldList(aux).find(f => f.key === key)?.name || key;

/**
 * Checks the JSON an administrator typed into the processor editor.
 * @param json The editor contents.
 * @returns An error message, or null when the definitions are usable.
 */
export const validateAuxConfigJson = (json: string): string | null => {
  if (json.trim() === '') {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return `Invalid JSON: ${e instanceof Error ? e.message : 'parse error'}`;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'The configuration must be a JSON object mapping each key to a field definition.';
  }
  for (const [name, field] of Object.entries(parsed as Record<string, any>)) {
    if (!field || typeof field !== 'object') {
      return `"${name}" must be an object.`;
    }
    for (const required of ['key', 'type', 'name']) {
      if (typeof field[required] !== 'string' || field[required] === '') {
        return `"${name}" is missing the "${required}" text property.`;
      }
    }
    if (!SUPPORTED_TYPES.includes(String(field.type).toLowerCase())) {
      return `"${name}" has type "${
        field.type
      }". Supported types: ${SUPPORTED_TYPES.join(', ')}.`;
    }
  }
  return null;
};

/* ---------------------------------------------------------------------------
 * Field builder (Admin → Processors)
 *
 * The builder edits the definitions as a list of rows rather than the stored
 * dictionary, so it can hold states the dictionary can't (an empty or
 * duplicate key while typing) and keep the display order explicit.
 * ------------------------------------------------------------------------- */

/** A field type the add-artifact form can render. */
export type AuxFieldType = 'string' | 'bool';

/** One field definition being edited in the builder. */
export interface FieldRow {
  /** Stable identity for React and input IDs; not stored. */
  uid: string;
  key: string;
  name: string;
  type: AuxFieldType;
  /** Placeholder text, or the checkbox label for bool fields. */
  placeholder: string;
  /** Pre-filled value; '' for none. Bool fields use 'true' or ''. */
  default: string;
  /** Key when the definitions were loaded, to warn when it is renamed. */
  originalKey?: string;
  /** New rows derive their key from the name until the key is edited. */
  autoKey?: boolean;
}

let rowCounter = 0;
const nextUid = () => `field-${++rowCounter}`;

/** Keys processors read from `artifact.config`: no spaces or quotes. */
const KEY_PATTERN = /^[A-Za-z0-9_.-]+$/;

/**
 * @param name A field label, e.g. "Group ID".
 * @returns A config key derived from it, e.g. "group_id".
 */
export const slugKey = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/** @returns An empty text field for the "Add field" button. */
export const newFieldRow = (): FieldRow => ({
  uid: nextUid(),
  key: '',
  name: '',
  type: 'string',
  placeholder: '',
  default: '',
  autoKey: true,
});

/**
 * Turns stored definitions into builder rows.
 * @param json The processor's config JSON.
 * @returns The rows, or an error when the JSON can't be shown as rows
 * (malformed, or a type the builder doesn't know). The caller then falls
 * back to the JSON editor so nothing is lost.
 */
export const rowsFromConfig = (
  json: string,
): { rows: FieldRow[]; error: string | null } => {
  if (json.trim() === '') {
    return { rows: [], error: null };
  }
  const error = validateAuxConfigJson(json);
  if (error) {
    return { rows: [], error };
  }
  const dict = JSON.parse(json) as Record<string, AuxField>;
  const rows = Object.entries(dict).map(([dictKey, field]) => {
    const key = field.key || dictKey;
    const type = field.type.toLowerCase() as AuxFieldType;
    const stored =
      field.default === undefined || field.default === null
        ? ''
        : String(field.default);
    return {
      uid: nextUid(),
      key,
      name: field.name ?? '',
      type,
      placeholder: field.placeholder ?? '',
      default: type === 'bool' ? (stored === 'true' ? 'true' : '') : stored,
      originalKey: key,
    };
  });
  return { rows, error: null };
};

/**
 * Turns builder rows into the JSON the API stores, in row order. `default`
 * is always a string (the API rejects JSON booleans) and is left out when
 * empty.
 * @param rows The rows.
 * @returns Pretty-printed JSON.
 */
export const configFromRows = (rows: FieldRow[]): string => {
  const dict: Record<string, AuxField> = {};
  for (const row of rows) {
    const field: AuxField = {
      key: row.key,
      type: row.type,
      name: row.name,
      placeholder: row.placeholder,
    };
    if (row.default !== '') {
      field.default = row.default;
    }
    dict[row.key] = field;
  }
  return JSON.stringify(dict, null, 2);
};

/** Problems with one row, by input. */
export interface FieldRowErrors {
  key?: string;
  name?: string;
}

/**
 * Checks the rows before saving.
 * @param rows The rows.
 * @returns Errors per row uid (only rows with problems), and a summary for
 * the save button, or null when the rows can be saved.
 */
export const validateFieldRows = (
  rows: FieldRow[],
): { byRow: Record<string, FieldRowErrors>; summary: string | null } => {
  const byRow: Record<string, FieldRowErrors> = {};
  const counts = new Map<string, number>();
  rows.forEach(r => counts.set(r.key, (counts.get(r.key) ?? 0) + 1));
  for (const row of rows) {
    const errors: FieldRowErrors = {};
    if (!row.name.trim()) {
      errors.name = 'Give the field a label.';
    }
    if (!row.key) {
      errors.key = 'Enter the key the processor reads.';
    } else if (!KEY_PATTERN.test(row.key)) {
      errors.key = 'Use letters, digits, ".", "-" or "_" only.';
    } else if ((counts.get(row.key) ?? 0) > 1) {
      errors.key = `Another field already uses "${row.key}".`;
    }
    if (errors.key || errors.name) {
      byRow[row.uid] = errors;
    }
  }
  const problems = Object.keys(byRow).length;
  return {
    byRow,
    summary:
      problems === 0
        ? null
        : `${problems} configuration field${
            problems === 1 ? ' needs' : 's need'
          } attention.`,
  };
};
