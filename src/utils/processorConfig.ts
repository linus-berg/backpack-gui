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
