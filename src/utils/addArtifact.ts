import { AddArtifactResponse } from 'api/backpack';

export type AddOutcome = 'added' | 'pending' | 'exists';

/**
 * Works out what `POST /artifact` actually did. The API returns 200 in every
 * case and only distinguishes outcomes through its `message`.
 * @param data The response body.
 */
export const classifyAddResponse = (
  data: AddArtifactResponse | undefined,
): AddOutcome => {
  const message = data?.message ?? '';
  if (/pending|approval/i.test(message)) {
    return 'pending';
  }
  if (/already/i.test(message)) {
    return 'exists';
  }
  return 'added';
};

/** Short user-facing description for each outcome. */
export const ADD_OUTCOME_TEXT: Record<AddOutcome, string> = {
  added: 'Added',
  pending: 'Waiting for approval',
  exists: 'Already tracked',
};
