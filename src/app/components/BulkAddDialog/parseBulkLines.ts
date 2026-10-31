import { AuxDict } from 'types/AuxDict';
import { auxDefaults, auxFieldList } from 'utils/processorConfig';
import { validateFilterInput } from 'utils/versionFilter';

export interface BulkLine {
  /** 1-based line number in the textarea. */
  line: number;
  raw: string;
  id: string;
  filter: string;
  config: Record<string, string>;
  /** Problems that stop this line from being submitted. */
  errors: string[];
  /** Problems worth knowing about that don't block submission. */
  warnings: string[];
}

/**
 * Parses the bulk-add format `id;filter;key=value;key=value`. Values may
 * themselves contain `=` (e.g. URLs with query strings). Blank lines and
 * lines starting with `#` are ignored.
 * @param text The textarea contents.
 * @param aux Field definitions, used for defaults and to flag unknown keys.
 */
export const parseBulkLines = (text: string, aux: AuxDict): BulkLine[] => {
  const knownKeys = new Set(auxFieldList(aux).map(f => f.key));
  const defaults = auxDefaults(aux);
  const seen = new Map<string, number>();
  const result: BulkLine[] = [];

  text.split('\n').forEach((raw, index) => {
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      return;
    }
    const lineNo = index + 1;
    const parts = trimmed.split(';');
    const id = parts[0].trim();
    const filter = (parts[1] ?? '').trim();
    const config: Record<string, string> = { ...defaults };
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!id) {
      errors.push('Missing artifact ID.');
    } else if (seen.has(id)) {
      errors.push(`Duplicate of line ${seen.get(id)}.`);
    } else {
      seen.set(id, lineNo);
    }

    const filterError = filter ? validateFilterInput(filter) : null;
    if (filterError) {
      errors.push(filterError);
    }

    for (const pair of parts.slice(2)) {
      const p = pair.trim();
      if (p === '') {
        continue;
      }
      const eq = p.indexOf('=');
      if (eq <= 0) {
        errors.push(`"${p}" isn't a key=value pair.`);
        continue;
      }
      const key = p.slice(0, eq).trim();
      config[key] = p.slice(eq + 1).trim();
      if (knownKeys.size > 0 && !knownKeys.has(key)) {
        warnings.push(`"${key}" isn't a configuration key for this processor.`);
      }
    }

    result.push({
      line: lineNo,
      raw: trimmed,
      id,
      filter,
      config,
      errors,
      warnings,
    });
  });

  return result;
};
