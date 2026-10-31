import { IconName, Intent } from '@blueprintjs/core';

interface ActionMeta {
  icon: IconName;
  label: string;
  intent: Intent;
  description: string;
}

/** Keeps literal keys while checking every entry against {@link ActionMeta}. */
const defineActions = <T extends Record<string, ActionMeta>>(actions: T) =>
  actions;

/**
 * Labels, icons and help text for artifact actions. The table, the inspector
 * and the Help dialog all read from here so they always match.
 */
export const ARTIFACT_ACTIONS = defineActions({
  preview: {
    icon: 'eye-open',
    label: 'Preview',
    intent: Intent.NONE,
    description:
      'Queries the upstream registry before adding an artifact, showing which versions exist, their files and direct dependencies. Use it to check the package name and whether your version filter matches what you expect.',
  },
  add: {
    icon: 'cube-add',
    label: 'Add artifact',
    intent: Intent.PRIMARY,
    description:
      'Registers a new root artifact. Backpack then discovers all of its versions and dependencies recursively.',
  },
  inspect: {
    icon: 'search',
    label: 'Inspect',
    intent: Intent.PRIMARY,
    description:
      'Opens the artifact’s versions, files and dependencies. Click a dependency to jump to it.',
  },
  track: {
    icon: 'refresh',
    label: 'Check for updates',
    intent: Intent.NONE,
    description:
      'Re-scans the upstream registry for an existing artifact. Use it when a new version was released upstream but Backpack hasn’t picked it up yet.',
  },
  validate: {
    icon: 'archive',
    label: 'Validate files',
    intent: Intent.NONE,
    description:
      'Checks that every file recorded for the artifact actually exists in storage and matches its metadata. Problems are reported in System Events.',
  },
  forceCollect: {
    icon: 'download',
    label: 'Force collect',
    intent: Intent.NONE,
    description:
      'Only on direct-collect processors. Immediately retries downloading versions that failed or are stuck.',
  },
  delete: {
    icon: 'trash',
    label: 'Delete',
    intent: Intent.DANGER,
    description:
      'Removes the artifact and its tracking metadata from Backpack. Administrators only.',
  },
});
