export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error && "shortMessage" in error) {
    const shortMessage = (error as { shortMessage?: string }).shortMessage;
    if (shortMessage) {
      return shortMessage;
    }
  }

  return "Something went wrong.";
}
