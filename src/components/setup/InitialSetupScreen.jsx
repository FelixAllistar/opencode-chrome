

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeProvider";

const PROVIDER_FIELDS = [
  {
    id: "apiKey",
    label: "OpenCode Zen API key",
    description:
      "Used by OpenCode Zen models and the bundled tools. Leave blank if you prefer another provider.",
    placeholder: "OpenCode Zen API Key (optional)",
  },
  {
    id: "googleApiKey",
    label: "Google Gemini API key",
    description: "Required for Gemini 1.5 Flash, Gemini 1.5 Pro, and Gemini 2.5 Pro.",
    placeholder: "Google Gemini API Key",
  },
  {
    id: "anthropicApiKey",
    label: "Anthropic Claude API key",
    description: "Powers Claude models such as Claude 3 Opus and Claude 3 Sonnet.",
    placeholder: "Anthropic API Key",
  },
  {
    id: "openaiApiKey",
    label: "OpenAI API key",
    description: "Allows direct access to OpenAI models like GPT-4o or GPT-4 Turbo.",
    placeholder: "OpenAI API Key",
  },
  {
    id: "openRouterApiKey",
    label: "OpenRouter API key",
    description: "Talk to OpenRouter-hosted models as an alternative to the built-in providers.",
    placeholder: "OpenRouter API Key",
  },
];

const OPTIONAL_FIELDS = [
  {
    id: "braveSearchApiKey",
    label: "Brave Search API key",
    description: "Unlocks the Brave Search tool used by the assistant for research.",
    placeholder: "Brave Search API Key (optional)",
  },
  {
    id: "context7ApiKey",
    label: "Context7 API key",
    description: "Streams contextual documentation directly into the sidebar.",
    placeholder: "Context7 API Key (optional)",
  },
];

const InputRow = ({ id, label, description, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-sidebar-foreground">
      {label}
    </label>
    <p className="text-xs text-muted-foreground">{description}</p>
    <Input
      id={id}
      name={id}
      type="password"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
    />
  </div>
);

export const InitialSetupScreen = ({ inputs, onInputChange, onSave }) => {
  const { theme, isDark } = useTheme();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate at least one provider key is provided
    const hasAtLeastOneKey = PROVIDER_FIELDS.some(field => inputs[field.id]?.trim());

    if (!hasAtLeastOneKey) {
      // Ideally show a toast or error state here, but for now we just prevent submission
      // The description text already says "Save at least one provider key..."
      return;
    }

    onSave();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-sidebar text-sidebar-foreground">
      <div className="w-full max-w-3xl px-4 py-10">
        <Card className="border border-sidebar-border/70 bg-card">
          <CardHeader className="px-6 pb-3 sm:px-8">
            <CardTitle className="text-2xl md:text-3xl">Welcome to OpenSidebar</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Save at least one provider key (OpenCode Zen, Gemini, Claude, OpenAI or OpenRouter) to unlock the chat.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-6 pb-0 sm:px-8">
              <div className="space-y-4">
                {PROVIDER_FIELDS.map((field) => (
                  <InputRow
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    description={field.description}
                    placeholder={field.placeholder}
                    value={inputs[field.id]}
                    onChange={onInputChange(field.id)}
                  />
                ))}
              </div>
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Optional extras
                </div>
                {OPTIONAL_FIELDS.map((field) => (
                  <InputRow
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    description={field.description}
                    placeholder={field.placeholder}
                    value={inputs[field.id]}
                    onChange={onInputChange(field.id)}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <Button type="submit" className="w-full sm:w-auto">
                Save & Start
              </Button>
              <p className="text-xs text-muted-foreground">
                Current theme: {theme} · {isDark ? "Dark" : "Light"} mode.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
