/**
 * Bundles Monaco with the app instead of letting @monaco-editor/react fetch
 * it from cdn.jsdelivr.net at runtime, which fails on locked-down networks
 * and pulls third-party code into an admin tool. Imported only by the lazily
 * loaded processor editor, so it doesn't weigh down other pages.
 */
import { loader } from '@monaco-editor/react';
/* Monaco's supported entry points (0.56+): the editor API, every editor
   feature, and only the languages the editor needs. */
import * as monaco from 'monaco-editor/editor';
import 'monaco-editor/features/register.all';
import 'monaco-editor/languages/features/json/register';
import 'monaco-editor/languages/definitions/markdown/register';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/languages/features/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    return label === 'json' ? new JsonWorker() : new EditorWorker();
  },
};

loader.config({ monaco });
