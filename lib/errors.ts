import { AppApiError } from "@estoreclub/app";

import { t } from "./strings";

/** A refusal's own sentence (the server writes it for customers); no answer at all is ours. */
export function messageOf(error: unknown): string {
  return error instanceof AppApiError && error.status
    ? error.message
    : t("common.failedMessage");
}

export function codeOf(error: unknown): string | undefined {
  return error instanceof AppApiError ? error.code : undefined;
}
