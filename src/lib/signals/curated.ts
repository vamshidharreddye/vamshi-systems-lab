import { normalizeSignal } from "./normalize";
import type { SignalItem } from "./types";

const curatedReferences = [
  {
    source: { id: "openai-docs", name: "OpenAI Developers", weight: 23 },
    raw: {
      title: "Tools and agent workflows in the OpenAI API",
      url: "https://platform.openai.com/docs/guides/tools",
      excerpt:
        "Official implementation guidance for connecting models to tools and composing observable agent workflows.",
      categories: ["agents", "developer tools", "API"]
    }
  },
  {
    source: { id: "github-docs", name: "GitHub Docs", weight: 22 },
    raw: {
      title: "GitHub Copilot documentation for builders",
      url: "https://docs.github.com/en/copilot",
      excerpt:
        "A stable reference for current Copilot capabilities, configuration, and developer workflows.",
      categories: ["copilot", "developer tools"]
    }
  },
  {
    source: { id: "aws-ai", name: "AWS", weight: 20 },
    raw: {
      title: "AWS generative AI architecture resources",
      url: "https://aws.amazon.com/ai/generative-ai/",
      excerpt:
        "First-party architecture and infrastructure material for operating generative AI systems on AWS.",
      categories: ["infrastructure", "cloud", "deployment"]
    }
  },
  {
    source: { id: "hugging-face-docs", name: "Hugging Face Docs", weight: 20 },
    raw: {
      title: "Transformers documentation and model workflows",
      url: "https://huggingface.co/docs/transformers/index",
      excerpt:
        "Official documentation for model loading, inference, training, and the surrounding open tooling ecosystem.",
      categories: ["models", "inference", "developer tools"]
    }
  }
];

export function getCuratedSignals(): SignalItem[] {
  return curatedReferences.flatMap(({ raw, source }) => {
    const item = normalizeSignal({ ...raw, publishedAt: null }, source);
    return item ? [{ ...item, curated: true }] : [];
  });
}
