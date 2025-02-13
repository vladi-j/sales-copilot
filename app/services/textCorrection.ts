import { ChatAnthropic } from "@langchain/anthropic";
import { getAnthropicKey } from "../util/getAnthropicKey";

export async function correctText(text: string, language: string): Promise<string> {
  const apiKey = await getAnthropicKey();
  const chat = new ChatAnthropic({
    anthropicApiKey: apiKey,
    model: "claude-3-haiku-20240307",
    temperature: 0.3,
  });

  const languageMap = {
    lv: "Latvian",
    et: "Estonian",
    lt: "Lithuanian",
    en: "English"
  };

  const prompt = `You are a ${languageMap[language as keyof typeof languageMap]} language expert specializing in correcting speech-to-text output. 
Please improve the following text while maintaining its original meaning and context.
Consider these specific instructions:

1. Fix any misheard words while preserving the intended meaning
2. Maintain proper ${languageMap[language as keyof typeof languageMap]} grammar and punctuation
3. Preserve any company names, technical terms, or industry jargon
4. Keep sentence structure natural for spoken ${languageMap[language as keyof typeof languageMap]}
5. Do not add or remove significant content
6. Ensure proper capitalization and spacing

Original STT text:
${text}

Please provide only the corrected text without any explanations or markdown.`;

  const response = await chat.invoke(prompt);
  return typeof response.content === 'string' ? response.content : response.content[0].type === 'text' ? response.content[0].text : '';
} 