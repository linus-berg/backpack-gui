/**
 * Copies text to the clipboard. Falls back to a hidden textarea and
 * `execCommand('copy')` when the async Clipboard API is unavailable, which is
 * the case on plain-HTTP deployments (non-secure contexts).
 * @param text The text to copy.
 * @returns True when the copy succeeded.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path.
    }
  }

  // Mount inside the open overlay (if any) so dialog focus traps don't
  // pull focus away before the copy runs.
  const host =
    (document.activeElement?.closest('.bp4-overlay') as HTMLElement | null) ??
    document.body;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  host.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  host.removeChild(textarea);
  return ok;
};
