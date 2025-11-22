"use client";

import { BrainIcon, SearchIcon } from "lucide-react";
import { Response } from "./response.tsx";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "./chain-of-thought.tsx";

const CHAIN_OF_THOUGHT_LABELS = {
  THINKING: "Thinking",
  USING_TOOL: "Using",
  SUCCESS: "Success",
  ERROR: "Error",
  COMPLETE: "Complete",
};

const CHAIN_OF_THOUGHT_DESCRIPTIONS = {
  ANALYZING_REQUEST: "Analyzing the request",
  PROCESSING: "Processing...",
  TOOL_EXECUTION_FAILED: "Tool execution failed",
  SUCCESSFULLY_RETRIEVED: "Successfully retrieved data",
  OPERATION_COMPLETED: "Operation completed successfully",
};

const CHAIN_OF_THOUGHT_STATUSES = {
  COMPLETE: "complete",
  ACTIVE: "active",
  PENDING: "pending",
};

const IMAGE_URL_REGEX =
  /(https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp|bmp|svg)(?:\?[^\s]*)?)/gi;

const extractImageUrlsFromText = (text: string | undefined) => {
  if (!text) return [];
  const matches = text.match(IMAGE_URL_REGEX);
  if (!matches) return [];
  return Array.from(new Set(matches));
};

const convertPartsToChainOfThought = (parts: any[]) => {
  const hasToolOrReasoningParts = parts.some(
    (part) =>
      part?.type === "reasoning" ||
      (part?.type?.startsWith("tool-") && part.state !== "output-error")
  );

  if (!hasToolOrReasoningParts) {
    return parts;
  }

  const chainOfThoughtSteps: any[] = [];
  const textParts: any[] = [];

  const getToolName = (part: any) => {
    if (part?.type?.startsWith("tool-")) {
      return part.type.replace("tool-", "");
    }
    return "Unknown Tool";
  };

  const extractUrl = (part: any) => {
    return part?.output?.url || part?.input?.url;
  };

  parts.forEach((part, index) => {
    if (part.type === "reasoning") {
      chainOfThoughtSteps.push({
        label: CHAIN_OF_THOUGHT_LABELS.THINKING,
        description: CHAIN_OF_THOUGHT_DESCRIPTIONS.ANALYZING_REQUEST,
        status:
          index < parts.length - 1
            ? CHAIN_OF_THOUGHT_STATUSES.COMPLETE
            : CHAIN_OF_THOUGHT_STATUSES.ACTIVE,
        icon: BrainIcon,
        content: (
          <div className="text-sm text-muted-foreground w-full overflow-x-auto whitespace-pre-wrap break-words">
            {part.text}
          </div>
        ),
      });
    } else if (part.type?.startsWith("tool-") && part.state !== "output-error") {
      const toolName = getToolName(part);
      const url = extractUrl(part);

      switch (part.state) {
        case "input-available":
          chainOfThoughtSteps.push({
            label: `${CHAIN_OF_THOUGHT_LABELS.USING_TOOL} ${toolName}`,
            description: url
              ? `Fetching: ${url}`
              : `Calling ${toolName} with: ${JSON.stringify(
                  part.input || {}
                ).substring(0, 100)}...`,
            status: CHAIN_OF_THOUGHT_STATUSES.ACTIVE,
            icon: SearchIcon,
            searchResults: url ? [url] : undefined,
            toolCallId: part.toolCallId,
          });
          break;

        case "output-available": {
          const successLabel = `${toolName} ${CHAIN_OF_THOUGHT_LABELS.SUCCESS}`;
          let successDescription =
            CHAIN_OF_THOUGHT_DESCRIPTIONS.SUCCESSFULLY_RETRIEVED;

          if (part.output?.status === 200) {
            successDescription = url
              ? `Successfully fetched ${url}`
              : `Fetched ${part.output.contentLength || 0} bytes`;
          } else if (part.output) {
            successDescription = url
              ? `Retrieved data from ${url}`
              : CHAIN_OF_THOUGHT_DESCRIPTIONS.OPERATION_COMPLETED;
          }

          chainOfThoughtSteps.push({
            label: successLabel,
            description: successDescription,
            status: CHAIN_OF_THOUGHT_STATUSES.COMPLETE,
            icon: SearchIcon,
            searchResults: url ? [url] : undefined,
            toolCallId: part.toolCallId,
          });
          break;
        }

        default:
          chainOfThoughtSteps.push({
            label: `${CHAIN_OF_THOUGHT_LABELS.USING_TOOL} ${toolName}`,
            description: CHAIN_OF_THOUGHT_DESCRIPTIONS.PROCESSING,
            status: CHAIN_OF_THOUGHT_STATUSES.PENDING,
            icon: SearchIcon,
            toolCallId: part.toolCallId,
          });
      }
    } else if (part.type === "text") {
      textParts.push(part);
    }
  });

  if (chainOfThoughtSteps.length > 0) {
    const chainOfThoughtPart = {
      type: "chain-of-thought",
      steps: chainOfThoughtSteps,
    };
    return [chainOfThoughtPart, ...textParts];
  }

  return parts;
};

type MessagePartsProps = {
  message: {
    parts?: any[];
    status?: string;
    role?: string;
    [key: string]: any;
  };
};

export function MessageParts({ message }: MessagePartsProps) {
  const baseParts = message.parts || [];
  const convertedParts = convertPartsToChainOfThought(baseParts);

  if (!convertedParts || convertedParts.length === 0) {
    return message.status === "streaming" ? (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="animate-pulse">Thinking...</div>
      </div>
    ) : (
      <Response />
    );
  }

  return (
    <div className="space-y-4">
      {convertedParts.map((part, index) => {
        if (part.type === "chain-of-thought" && part.steps) {
          return (
            <ChainOfThought
              key={`chain-of-thought-${index}`}
              defaultOpen={false}
            >
              <ChainOfThoughtHeader>Chain of Thought</ChainOfThoughtHeader>
              <ChainOfThoughtContent>
                {part.steps.map((step: any, stepIndex: number) => (
                  <ChainOfThoughtStep
                    key={stepIndex}
                    icon={step.icon}
                    label={step.label}
                    description={step.description}
                    status={step.status}
                  >
                    {step.searchResults && step.searchResults.length > 0 && (
                      <ChainOfThoughtSearchResults>
                        {step.searchResults.map((url: string, urlIndex: number) => (
                          <ChainOfThoughtSearchResult key={urlIndex}>
                            {url}
                          </ChainOfThoughtSearchResult>
                        ))}
                      </ChainOfThoughtSearchResults>
                    )}

                    {step.image && (
                      <ChainOfThoughtImage caption={step.image.caption}>
                        <img
                          src={step.image.src}
                          alt={step.image.alt}
                          className="max-w-full h-auto rounded"
                        />
                      </ChainOfThoughtImage>
                    )}

                    {step.content && step.content}
                  </ChainOfThoughtStep>
                ))}
              </ChainOfThoughtContent>
            </ChainOfThought>
          );
        }

        if (part.type?.startsWith("tool-") && part.state === "output-error") {
          return (
            <div
              key={`error-${index}`}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
            >
              <div className="flex items-center gap-2 text-destructive">
                <div className="font-medium text-sm">Error</div>
              </div>
              <div className="text-sm text-destructive/80 mt-1">
                {part.errorText || part.error || "An error occurred"}
              </div>
            </div>
          );
        }

        if (part.type === "text") {
          const text = part.text || "";
          const imageUrls = extractImageUrlsFromText(text);

          return (
            <div key={`text-${index}`} className="space-y-4">
              <Response>{text}</Response>
              {imageUrls.length > 0 && (
                <div className="flex flex-col gap-4">
                  {imageUrls.map((url, urlIndex) => (
                    <div
                      key={`${url}-${urlIndex}`}
                      className="rounded-lg border bg-background p-2"
                    >
                      <img
                        src={url}
                        alt="Linked content"
                        className="max-w-full h-auto rounded-md shadow-sm"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (part.type === "file" && part.mediaType?.startsWith("image/")) {
          return (
            <div key={`image-${index}`} className="my-4">
              <img
                src={part.url}
                alt={part.filename || "Image"}
                className="max-w-full h-auto rounded-lg border shadow-sm"
                loading="lazy"
              />
            </div>
          );
        }

        if (part.type === "image") {
          const dataUrl =
            part.image instanceof Uint8Array
              ? `data:image/png;base64,${btoa(
                  String.fromCharCode(...part.image)
                )}`
              : typeof part.image === "string" &&
                part.image.startsWith("data:")
              ? part.image
              : `data:image/png;base64,${part.image}`;

          return (
            <div key={`image-${index}`} className="my-4">
              <img
                src={dataUrl}
                alt="Generated image"
                className="max-w-full h-auto rounded-lg border shadow-sm"
                loading="lazy"
              />
            </div>
          );
        }

        return (
          <div
            key={`unknown-${index}`}
            className="p-4 bg-muted/50 rounded-md"
          >
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2">
              Unknown Part Type: {part.type}
            </h4>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(part, null, 2)}
            </pre>
          </div>
        );
      })}
      {message.status === "streaming" && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-pulse">Generating...</div>
        </div>
      )}
    </div>
  );
}

