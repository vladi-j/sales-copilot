export const getAnthropicKey = async (): Promise<string> => {
    const response = await fetch("/api/anthropic-key", { cache: "no-store" });
    const result = await response.json();
    return result.key;
  };