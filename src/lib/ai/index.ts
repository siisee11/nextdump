/**
 * AI SDK v6 Configuration
 *
 * This module provides AI SDK v6 utilities and configurations.
 * @see https://ai-sdk.dev
 */

// OpenAI provider - configure with OPENAI_API_KEY env variable
export { openai } from "@ai-sdk/openai";
// Re-export commonly used AI SDK functions
export { useChat } from "@ai-sdk/react";
export type { UIMessage } from "ai";
export { convertToModelMessages, DefaultChatTransport, streamText } from "ai";
