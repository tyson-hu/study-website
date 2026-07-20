"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getTextInputPlaceholder } from "@/lib/quiz";
import type { TextFieldAnswerMap, TextFieldConfig } from "@/types/question";

interface TextFieldsQuestionProps {
  questionId: string;
  fields: TextFieldConfig[];
  values: TextFieldAnswerMap;
  disabled: boolean;
  showFeedback: boolean;
  fieldResults?: Record<string, boolean>;
  onChange: (fieldId: string, value: string) => void;
}

export function TextFieldsQuestion({
  questionId,
  fields,
  values,
  disabled,
  showFeedback,
  fieldResults,
  onChange,
}: TextFieldsQuestionProps) {
  const gridClass =
    fields.length === 1
      ? "grid gap-4"
      : fields.length === 2
        ? "grid gap-4 sm:grid-cols-2"
        : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={gridClass}>
      {fields.map((field) => {
        const fieldCorrect = fieldResults?.[field.id];

        return (
          <div key={field.id} className="flex flex-col gap-2">
            <Label htmlFor={`${questionId}-${field.id}`}>{field.label}</Label>
            <Input
              id={`${questionId}-${field.id}`}
              value={values[field.id] ?? ""}
              onChange={(event) => onChange(field.id, event.target.value)}
              disabled={disabled}
              placeholder={getTextInputPlaceholder(field)}
              className={cn(
                "bg-background font-mono text-base",
                showFeedback &&
                  fieldCorrect === true &&
                  "border-green-500 ring-1 ring-green-500/30",
                showFeedback &&
                  fieldCorrect === false &&
                  "border-destructive ring-1 ring-destructive/30"
              )}
              autoComplete="off"
              spellCheck={false}
            />
            {(field.matchMode === "hex" || field.matchMode === "ipv6") && (
              <p className="text-xs text-muted-foreground">Not case sensitive</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
