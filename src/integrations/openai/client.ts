import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

export { openai };
