export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActionError';
  }
}

export function actionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ActionError) return error.message;
  console.error('[server-action]', error);
  return fallback;
}
