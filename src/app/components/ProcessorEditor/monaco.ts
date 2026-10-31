/**
 * Bundles Monaco with the app instead of letting @monaco-editor/react fetch
 * it from cdn.jsdelivr.net at runtime, which fails on locked-down networks
 * and pulls third-party code into an admin tool. Imported only by the lazily
 * loaded processor editor, so it doesn't weigh down other pages.
 */
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/editor/edcore.main';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    return label === 'json' ? new JsonWorker() : new EditorWorker();
  },
};

loader.config({ monaco });
