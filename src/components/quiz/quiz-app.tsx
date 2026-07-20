"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { MatchQuestion } from "@/components/quiz/match-question";
import { TextFieldsQuestion } from "@/components/quiz/text-fields-question";
import { SiteHeader } from "@/components/layout/site-header";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { SafeLightRays } from "@/components/quiz/safe-light-rays";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useQuizKeyboard } from "@/hooks/use-quiz-keyboard";
import {
  useCompatibleQuizProgress,
  usePersistedQuizProgress,
  type QuizProgressApi,
  type QuizProgressMode,
} from "@/hooks/use-quiz-progress";
import type { QuizSetId } from "@/lib/question-sets";
import {
  evaluateAnswer,
  getTextFieldResults,
  getTextFields,
  isMatchQuestion,
  isMultipleChoice,
  isQuestionAnswered,
  isTextInput,
  scoreResults,
} from "@/lib/quiz";
import { formatQuizText } from "@/lib/format-text";
import { cn } from "@/lib/utils";
import type {
  MatchAnswerMap,
  Question,
  QuestionResult,
  QuestionSet,
  QuizMode,
  TextFieldAnswerMap,
} from "@/types/question";

export interface QuizAppProps {
  setId: QuizSetId;
  questionSet: QuestionSet;
  mode: QuizMode;
  /** In-memory mode when persistence or effects fail. */
  progressMode?: QuizProgressMode;
}

export function QuizApp({
  setId,
  questionSet,
  mode,
  progressMode = "persisted",
}: QuizAppProps) {
  if (progressMode === "compatible") {
    return (
      <QuizAppCompatible
        setId={setId}
        questionSet={questionSet}
        mode={mode}
      />
    );
  }

  return (
    <QuizAppPersisted setId={setId} questionSet={questionSet} mode={mode} />
  );
}

function QuizAppPersisted({
  setId,
  questionSet,
  mode,
}: Omit<QuizAppProps, "progressMode">) {
  const identity = useMemo(
    () => ({
      setId,
      mode,
      schemaVersion: questionSet.schemaVersion,
      totalQuestions: questionSet.totalQuestions,
    }),
    [setId, mode, questionSet.schemaVersion, questionSet.totalQuestions]
  );
  const api = usePersistedQuizProgress(identity);

  return (
    <QuizAppView
      questionSet={questionSet}
      mode={mode}
      progressMode="persisted"
      {...api}
    />
  );
}

function QuizAppCompatible({
  setId,
  questionSet,
  mode,
}: Omit<QuizAppProps, "progressMode">) {
  const identity = useMemo(
    () => ({
      setId,
      mode,
      schemaVersion: questionSet.schemaVersion,
      totalQuestions: questionSet.totalQuestions,
    }),
    [setId, mode, questionSet.schemaVersion, questionSet.totalQuestions]
  );
  const api = useCompatibleQuizProgress(identity);

  return (
    <QuizAppView
      questionSet={questionSet}
      mode={mode}
      progressMode="compatible"
      {...api}
    />
  );
}

function QuizAppView({
  questionSet,
  mode,
  progressMode,
  progress,
  updateProgress,
  restartQuiz,
}: Omit<QuizAppProps, "setId"> &
  QuizProgressApi & {
    progressMode: QuizProgressMode;
  }) {
  const { questions, title, totalQuestions } = questionSet;
  const quizMode = mode;
  const isPractice = quizMode === "practice";
  const isCompatible = progressMode === "compatible";

  const {
    currentIndex,
    selections,
    textFieldAnswers,
    matchAnswers,
    checked,
    testSubmitted,
    showResults,
  } = progress;

  const currentQuestion = questions[currentIndex];

  const results: QuestionResult[] = useMemo(
    () =>
      questions.map((q) => {
        const selectedIds = selections[q.id] ?? [];
        const fieldAnswers = textFieldAnswers[q.id] ?? {};
        const matchAnswer = matchAnswers[q.id] ?? {};
        const isEvaluated =
          (isPractice && checked[q.id]) ||
          (quizMode === "test" && testSubmitted);

        return {
          questionId: q.id,
          selectedIds,
          textFieldAnswers: fieldAnswers,
          matchAnswer,
          state: isEvaluated
            ? evaluateAnswer(q, selectedIds, fieldAnswers, matchAnswer)
            : "unanswered",
        };
      }),
    [
      questions,
      selections,
      textFieldAnswers,
      matchAnswers,
      checked,
      isPractice,
      quizMode,
      testSubmitted,
    ]
  );

  const stats = useMemo(() => scoreResults(results), [results]);
  const answeredCount = useMemo(
    () =>
      questions.filter((q) =>
        isQuestionAnswered(
          q,
          selections[q.id] ?? [],
          textFieldAnswers[q.id],
          matchAnswers[q.id]
        )
      ).length,
    [questions, selections, textFieldAnswers, matchAnswers]
  );
  const progressValue =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const currentQuestionId = currentQuestion?.id ?? "";
  const currentSelection = useMemo(
    () => selections[currentQuestionId] ?? [],
    [selections, currentQuestionId]
  );
  const currentTextFieldAnswers = useMemo(
    () => textFieldAnswers[currentQuestionId] ?? {},
    [textFieldAnswers, currentQuestionId]
  );
  const currentMatchAnswer = useMemo(
    () => matchAnswers[currentQuestionId] ?? {},
    [matchAnswers, currentQuestionId]
  );
  const currentTextFields = currentQuestion
    ? getTextFields(currentQuestion)
    : [];
  const textFieldResults =
    currentQuestion && isTextInput(currentQuestion)
      ? getTextFieldResults(currentQuestion, currentTextFieldAnswers)
      : null;
  const isCurrentChecked = isPractice
    ? (checked[currentQuestion?.id ?? ""] ?? false)
    : testSubmitted;
  const showCurrentFeedback = isPractice
    ? isCurrentChecked
    : testSubmitted;
  const optionsLocked = isPractice ? isCurrentChecked : testSubmitted;
  const currentResult = results[currentIndex];

  const toggleOption = useCallback(
    (question: Question, optionId: string) => {
      if (optionsLocked) return;
      if (isPractice && checked[question.id]) return;

      updateProgress((prev) => {
        const existing = prev.selections[question.id] ?? [];

        if (isMultipleChoice(question)) {
          const next = existing.includes(optionId)
            ? existing.filter((id) => id !== optionId)
            : [...existing, optionId];
          return {
            ...prev,
            selections: { ...prev.selections, [question.id]: next },
          };
        }

        return {
          ...prev,
          selections: { ...prev.selections, [question.id]: [optionId] },
        };
      });
    },
    [checked, isPractice, optionsLocked, updateProgress]
  );

  const setTextFieldAnswer = useCallback(
    (questionId: string, fieldId: string, value: string) => {
      if (optionsLocked) return;
      if (isPractice && checked[questionId]) return;

      updateProgress((prev) => ({
        ...prev,
        textFieldAnswers: {
          ...prev.textFieldAnswers,
          [questionId]: {
            ...(prev.textFieldAnswers[questionId] ?? {}),
            [fieldId]: value,
          },
        },
      }));
    },
    [checked, isPractice, optionsLocked, updateProgress]
  );

  const setMatchAnswer = useCallback(
    (questionId: string, leftId: string, rightId: string | null) => {
      if (optionsLocked) return;
      if (isPractice && checked[questionId]) return;

      updateProgress((prev) => {
        const current = { ...(prev.matchAnswers[questionId] ?? {}) };

        if (rightId === null) {
          delete current[leftId];
        } else {
          current[leftId] = rightId;
        }

        return {
          ...prev,
          matchAnswers: { ...prev.matchAnswers, [questionId]: current },
        };
      });
    },
    [checked, isPractice, optionsLocked, updateProgress]
  );

  const checkCurrent = useCallback(() => {
    if (!currentQuestion || !isPractice) return;

    const hasAnswer = isQuestionAnswered(
      currentQuestion,
      currentSelection,
      currentTextFieldAnswers,
      currentMatchAnswer
    );

    if (!hasAnswer) {
      toast.message("Enter or select an answer before checking.");
      return;
    }

    updateProgress((prev) => ({
      ...prev,
      checked: { ...prev.checked, [currentQuestion.id]: true },
    }));

    const state = evaluateAnswer(
      currentQuestion,
      currentSelection,
      currentTextFieldAnswers,
      currentMatchAnswer
    );
    if (state === "correct") {
      toast.success("Correct!");
    } else if (state === "partial") {
      toast.warning("Partially correct — review the full answer.");
    } else {
      toast.error("Incorrect — see the correct answer highlighted.");
    }
  }, [
    currentQuestion,
    currentSelection,
    currentTextFieldAnswers,
    currentMatchAnswer,
    isPractice,
    updateProgress,
  ]);

  const submitTest = useCallback(() => {
    const unanswered = questions.filter(
      (q) =>
        !isQuestionAnswered(
          q,
          selections[q.id] ?? [],
          textFieldAnswers[q.id],
          matchAnswers[q.id]
        )
    );

    if (unanswered.length > 0) {
      toast.warning(
        `${unanswered.length} question${unanswered.length === 1 ? "" : "s"} unanswered — they will count as incorrect.`
      );
    }

    updateProgress({
      testSubmitted: true,
      showResults: true,
    });
    toast.success("Test submitted!");
  }, [questions, selections, textFieldAnswers, matchAnswers, updateProgress]);

  const goNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      updateProgress({ currentIndex: currentIndex + 1 });
      return;
    }

    if (isPractice) {
      updateProgress({ showResults: true });
    }
  }, [currentIndex, totalQuestions, isPractice, updateProgress]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      updateProgress({ currentIndex: currentIndex - 1 });
    }
  }, [currentIndex, updateProgress]);

  const choiceOptionIds = useMemo(
    () => currentQuestion?.options.map((o) => o.id) ?? [],
    [currentQuestion]
  );

  const matchLeftIds = useMemo(
    () => currentQuestion?.matchPairs?.map((p) => p.id) ?? [],
    [currentQuestion]
  );

  const [pendingMatchLeftId, setPendingMatchLeftId] = useState<string | null>(
    null
  );
  const [pendingMatchQuestionId, setPendingMatchQuestionId] = useState(
    currentQuestion?.id
  );
  const [matchRightIds, setMatchRightIds] = useState<string[]>([]);

  // Clear pending left on question change; keep matchRightIds intact.
  if (currentQuestion?.id !== pendingMatchQuestionId) {
    setPendingMatchQuestionId(currentQuestion?.id);
    setPendingMatchLeftId(null);
  }

  const isCurrentAnswered = currentQuestion
    ? isQuestionAnswered(
        currentQuestion,
        currentSelection,
        currentTextFieldAnswers,
        currentMatchAnswer
      )
    : false;

  const onToggleChoice = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      toggleOption(currentQuestion, optionId);
    },
    [currentQuestion, toggleOption]
  );

  const onPairMatch = useCallback(
    (leftId: string, rightId: string) => {
      if (!currentQuestion) return;

      // Mirror MatchQuestion right-click: clear other lefts using same rightId
      for (const [otherLeft, matchedRight] of Object.entries(
        currentMatchAnswer
      )) {
        if (matchedRight === rightId && otherLeft !== leftId) {
          setMatchAnswer(currentQuestion.id, otherLeft, null);
        }
      }
      setMatchAnswer(currentQuestion.id, leftId, rightId);
    },
    [currentQuestion, currentMatchAnswer, setMatchAnswer]
  );

  useQuizKeyboard({
    enabled: Boolean(currentQuestion) && !showResults,
    quizMode,
    optionsLocked,
    isCurrentChecked,
    isCurrentAnswered,
    isLastQuestion: currentIndex === totalQuestions - 1,
    answeredCount,
    showResults,
    questionType: currentQuestion?.type,
    choiceOptionIds,
    onToggleChoice,
    onCheck: checkCurrent,
    onNext: goNext,
    onPrev: goPrev,
    onSubmitTest: submitTest,
    matchLeftIds,
    matchRightIds,
    pendingMatchLeftId,
    onSetPendingMatchLeft: setPendingMatchLeftId,
    onPairMatch,
  });

  if (totalQuestions === 0 || questions.length === 0) {
    return (
      <div
        className={cn(
          "relative flex min-h-full flex-1 flex-col",
          !isPractice && "bg-[var(--canvas-soft)]"
        )}
      >
        {isPractice && !isCompatible && (
          <>
            <div className="absolute inset-0 -z-10 bg-[var(--canvas-soft)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <SafeLightRays />
            </div>
          </>
        )}
        {(isCompatible || !isPractice) && (
          <div className="absolute inset-0 -z-10 bg-[var(--canvas-soft)]" />
        )}
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <Card className="shadow-elevation-3 w-full border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-[-0.4px]">
                No questions available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {title} does not have any questions yet. Head back home to pick
                another set.
              </p>
            </CardContent>
          </Card>
          <Button render={<Link href="/" />}>Back home</Button>
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-h-full flex-1 flex-col",
        !isPractice && "bg-[var(--canvas-soft)]"
      )}
    >
      {isPractice && !isCompatible && (
        <>
          <div className="absolute inset-0 -z-10 bg-[var(--canvas-soft)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <SafeLightRays />
          </div>
        </>
      )}
      {(isCompatible || !isPractice) && (
        <div className="absolute inset-0 -z-10 bg-[var(--canvas-soft)]" />
      )}
      <SiteHeader />

      {isCompatible && (
        <div className="border-b border-border bg-[var(--canvas-soft)]">
          <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Compatible mode is on — answers stay for this session only (not
              saved across refreshes).
            </p>
            <Badge variant="secondary">Compatible</Badge>
          </div>
        </div>
      )}

      <header className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs text-muted-foreground">
                Question {currentQuestion.number} of {totalQuestions}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {isPractice ? "Practice" : "Test"}
                </Badge>
                {isPractice && answeredCount > 0 && stats.correct > 0 && (
                  <Badge variant="secondary">
                    {stats.correct} correct so far
                  </Badge>
                )}
                {!isPractice && !testSubmitted && (
                  <Badge variant="secondary">
                    {answeredCount}/{totalQuestions} answered
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={restartQuiz}>
              <RotateCcw data-icon="inline-start" />
              Restart
            </Button>
          </div>
          <Progress value={progressValue} className="h-1.5" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <Card className="shadow-elevation-3 overflow-hidden border-border bg-card">
          <div className="border-b border-border bg-card px-6 py-5">
            <p className="mb-2 font-mono text-xs text-muted-foreground">
              Question {currentQuestion.number}
            </p>
            <p className="text-lg leading-relaxed font-semibold tracking-[-0.4px] text-foreground sm:text-xl">
              {formatQuizText(currentQuestion.question)}
            </p>

            {currentQuestion.media?.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="relative mx-auto mt-5 w-full max-w-md overflow-hidden rounded-lg border border-border bg-background p-2"
              >
                <Image
                  src={item.url}
                  alt={`Question ${currentQuestion.number} exhibit`}
                  width={500}
                  height={250}
                  className="h-auto w-full rounded-md object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>

          <CardContent className="flex flex-col gap-5 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs text-muted-foreground">
                {getAnswerPrompt(currentQuestion)}
              </p>
              <Badge variant="outline" className="text-xs">
                {getQuestionTypeLabel(currentQuestion)}
              </Badge>
            </div>

            {isTextInput(currentQuestion) ? (
              <TextFieldsQuestion
                questionId={currentQuestion.id}
                fields={currentTextFields}
                values={currentTextFieldAnswers}
                disabled={optionsLocked}
                showFeedback={showCurrentFeedback}
                fieldResults={
                  showCurrentFeedback ? textFieldResults ?? undefined : undefined
                }
                onChange={(fieldId, value) =>
                  setTextFieldAnswer(currentQuestion.id, fieldId, value)
                }
              />
            ) : isMatchQuestion(currentQuestion) ? (
              <MatchQuestion
                question={currentQuestion}
                matchAnswer={currentMatchAnswer}
                disabled={optionsLocked}
                showFeedback={showCurrentFeedback}
                onChange={(leftId, rightId) =>
                  setMatchAnswer(currentQuestion.id, leftId, rightId)
                }
                pendingLeftId={pendingMatchLeftId}
                onPendingLeftIdChange={setPendingMatchLeftId}
                onRightOrderChange={setMatchRightIds}
              />
            ) : isMultipleChoice(currentQuestion) ? (
              <div className="flex flex-col gap-2.5">
                {currentQuestion.options.map((option) => (
                  <OptionRow
                    key={option.id}
                    optionId={option.id}
                    label={formatQuizText(option.text)}
                    checked={currentSelection.includes(option.id)}
                    disabled={optionsLocked}
                    mode="checkbox"
                    state={getOptionState(
                      option.id,
                      currentQuestion,
                      showCurrentFeedback,
                      currentSelection
                    )}
                    onSelect={() =>
                      toggleOption(currentQuestion, option.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <RadioGroup
                value={currentSelection[0] ?? ""}
                onValueChange={(value) =>
                  toggleOption(currentQuestion, value)
                }
                disabled={optionsLocked}
                className="flex flex-col gap-2.5"
              >
                {currentQuestion.options.map((option) => (
                  <OptionRow
                    key={option.id}
                    optionId={option.id}
                    label={formatQuizText(option.text)}
                    checked={currentSelection.includes(option.id)}
                    disabled={optionsLocked}
                    mode="radio"
                    state={getOptionState(
                      option.id,
                      currentQuestion,
                      showCurrentFeedback,
                      currentSelection
                    )}
                    onSelect={() =>
                      toggleOption(currentQuestion, option.id)
                    }
                  />
                ))}
              </RadioGroup>
            )}

            {showCurrentFeedback && (
              <FeedbackBanner
                result={currentResult}
                question={currentQuestion}
              />
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span
                      className={cn(
                        "inline-flex",
                        currentIndex === 0 && "cursor-not-allowed"
                      )}
                    />
                  }
                >
                  <Button
                    variant="outline"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                  >
                    <ArrowLeft data-icon="inline-start" />
                    Previous
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Previous <Kbd>←</Kbd>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span
                      className={cn(
                        "inline-flex",
                        !isPractice &&
                          !testSubmitted &&
                          currentIndex === totalQuestions - 1 &&
                          "cursor-not-allowed"
                      )}
                    />
                  }
                >
                  <Button
                    variant="outline"
                    onClick={goNext}
                    disabled={
                      !isPractice &&
                      !testSubmitted &&
                      currentIndex === totalQuestions - 1
                    }
                  >
                    {isPractice && currentIndex === totalQuestions - 1
                      ? "Finish"
                      : "Next"}
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPractice && currentIndex === totalQuestions - 1
                    ? "Finish"
                    : "Next"}{" "}
                  <Kbd>→</Kbd>
                </TooltipContent>
              </Tooltip>
            </div>

            {isPractice && !isCurrentChecked && (
              <Button onClick={checkCurrent}>
                Check answer
                <Kbd className="ml-1">⏎</Kbd>
              </Button>
            )}

            {!isPractice && !testSubmitted && (
              <Button
                onClick={submitTest}
                disabled={answeredCount === 0}
              >
                Submit test
                <Kbd className="ml-1">⏎</Kbd>
              </Button>
            )}
          </CardFooter>
        </Card>

        <QuestionNavigator
          questions={questions}
          results={results}
          selections={selections}
          textFieldAnswers={textFieldAnswers}
          matchAnswers={matchAnswers}
          checked={checked}
          testSubmitted={testSubmitted}
          quizMode={quizMode}
          currentIndex={currentIndex}
          onSelect={(index) => updateProgress({ currentIndex: index })}
        />
      </main>

      <ResultsDialog
        open={showResults}
        onOpenChange={(open) => updateProgress({ showResults: open })}
        stats={stats}
        total={totalQuestions}
        mode={quizMode}
        onReview={() => updateProgress({ showResults: false })}
        onRestart={restartQuiz}
      />
    </div>
  );
}

function getAnswerPrompt(question: Question): string {
  if (isTextInput(question)) {
    const count = getTextFields(question).length;
    return count > 1 ? "Fill in all fields" : "Type your answer";
  }
  if (isMatchQuestion(question)) return "Match each item";
  if (isMultipleChoice(question)) return "Select all that apply";
  return "Select one answer";
}

function getQuestionTypeLabel(question: Question): string {
  if (isTextInput(question)) {
    const count = getTextFields(question).length;
    return count > 1 ? "Multi-field input" : "Type answer";
  }
  if (isMatchQuestion(question)) return "Match";
  if (isMultipleChoice(question)) return "Multiple choice";
  return "Single choice";
}

type OptionVisualState = "default" | "correct" | "incorrect" | "missed";

function getOptionState(
  optionId: string,
  question: Question,
  showFeedback: boolean,
  selectedIds: string[]
): OptionVisualState {
  if (!showFeedback) return "default";

  const isCorrect = question.correctOptionIds.includes(optionId);
  const isSelected = selectedIds.includes(optionId);

  if (isCorrect && isSelected) return "correct";
  if (isCorrect && !isSelected) return "missed";
  if (!isCorrect && isSelected) return "incorrect";
  return "default";
}

function OptionRow({
  optionId,
  label,
  checked,
  disabled,
  mode,
  state,
  onSelect,
}: {
  optionId: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  mode: "radio" | "checkbox";
  state: OptionVisualState;
  onSelect: () => void;
}) {
  const controlId = `option-${optionId}`;

  return (
    <div
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-4 transition-colors",
        disabled && "cursor-default",
        state === "default" &&
          !checked &&
          "border-border hover:border-foreground/20 hover:bg-[var(--canvas-soft)]",
        state === "default" &&
          checked &&
          "border-foreground/30 bg-[var(--canvas-soft)] ring-1 ring-foreground/10",
        state === "correct" && "border-green-500/50 bg-green-500/10",
        state === "incorrect" && "border-destructive/50 bg-destructive/10",
        state === "missed" && "border-amber-500/50 bg-amber-500/10"
      )}
      onClick={() => !disabled && onSelect()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-medium",
          state === "default" && checked
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-[var(--canvas-soft)] text-muted-foreground"
        )}
      >
        {optionId}
      </span>

      {mode === "checkbox" ? (
        <Checkbox
          id={controlId}
          checked={checked}
          disabled={disabled}
          tabIndex={-1}
          onCheckedChange={() => onSelect()}
          className="sr-only"
        />
      ) : (
        <RadioGroupItem
          value={optionId}
          id={controlId}
          disabled={disabled}
          tabIndex={-1}
          className="sr-only"
        />
      )}

      <Label
        className="flex-1 cursor-pointer pt-0.5 text-sm leading-relaxed font-normal text-foreground sm:text-base"
      >
        {label}
      </Label>

      {state === "correct" && (
        <CheckCircle2 className="mt-0.5 shrink-0 text-green-500" />
      )}
      {state === "incorrect" && (
        <XCircle className="mt-0.5 shrink-0 text-destructive" />
      )}
      {state === "missed" && (
        <CheckCircle2 className="mt-0.5 shrink-0 text-amber-500" />
      )}
    </div>
  );
}

function FeedbackBanner({
  result,
  question,
}: {
  result: QuestionResult;
  question: Question;
}) {
  const correctTexts = isTextInput(question)
    ? getTextFields(question).map(
        (field) =>
          `${field.label}: ${field.acceptedAnswers.map((answer) => formatQuizText(answer)).join(" or ")}`
      )
    : isMatchQuestion(question)
      ? (question.matchPairs ?? []).map(
          (pair) => `${pair.left} → ${formatQuizText(pair.right)}`
        )
      : question.options
          .filter((o) => question.correctOptionIds.includes(o.id))
          .map((o) => `${o.id}. ${formatQuizText(o.text)}`);

  if (result.state === "correct") {
    return (
      <Alert className="border-green-500/30 bg-green-500/10">
        <CheckCircle2 className="text-green-500" />
        <AlertTitle>Correct!</AlertTitle>
        <AlertDescription>Nice work — you got this one.</AlertDescription>
      </Alert>
    );
  }

  if (result.state === "partial") {
    return (
      <Alert className="border-amber-500/30 bg-amber-500/10">
        <CircleHelp className="text-amber-500" />
        <AlertTitle>Partially correct</AlertTitle>
        <AlertDescription>
          You selected some correct answers but missed others or included
          incorrect ones.
          <Separator className="my-2" />
          Full answer: {correctTexts.join(" · ")}
        </AlertDescription>
      </Alert>
    );
  }

  if (result.state === "unanswered") {
    return (
      <Alert>
        <CircleHelp />
        <AlertTitle>No answer selected</AlertTitle>
        <AlertDescription>
          Correct answer{correctTexts.length > 1 ? "s" : ""}:{" "}
          {correctTexts.join(" · ")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <XCircle />
      <AlertTitle>Incorrect</AlertTitle>
      <AlertDescription>
        Correct answer{correctTexts.length > 1 ? "s" : ""}:{" "}
        {correctTexts.join(" · ")}
      </AlertDescription>
    </Alert>
  );
}

function QuestionNavigator({
  questions,
  results,
  selections,
  textFieldAnswers,
  matchAnswers,
  checked,
  testSubmitted,
  quizMode,
  currentIndex,
  onSelect,
}: {
  questions: Question[];
  results: QuestionResult[];
  selections: Record<string, string[]>;
  textFieldAnswers: Record<string, TextFieldAnswerMap>;
  matchAnswers: Record<string, MatchAnswerMap>;
  checked: Record<string, boolean>;
  testSubmitted: boolean;
  quizMode: QuizMode;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="shadow-elevation-2 rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Jump to question
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, index) => {
          const result = results[index];
          const hasAnswer = isQuestionAnswered(
            q,
            selections[q.id] ?? [],
            textFieldAnswers[q.id],
            matchAnswers[q.id]
          );
          const isActive = index === currentIndex;
          const isEvaluated =
            (quizMode === "practice" && checked[q.id]) ||
            (quizMode === "test" && testSubmitted);

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "flex size-9 items-center justify-center rounded-md border font-mono text-xs font-medium transition-colors",
                isActive && "border-foreground bg-foreground text-background",
                !isActive &&
                  isEvaluated &&
                  result.state === "correct" &&
                  "border-green-500/40 bg-green-500/15",
                !isActive &&
                  isEvaluated &&
                  result.state === "partial" &&
                  "border-amber-500/40 bg-amber-500/15",
                !isActive &&
                  isEvaluated &&
                  (result.state === "incorrect" ||
                    result.state === "unanswered") &&
                  "border-destructive/40 bg-destructive/15",
                !isActive &&
                  !isEvaluated &&
                  hasAnswer &&
                  "border-foreground/30 bg-[var(--canvas-soft)]",
                !isActive &&
                  !isEvaluated &&
                  !hasAnswer &&
                  "hover:bg-[var(--canvas-soft)]"
              )}
            >
              {q.number}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultsDialog({
  open,
  onOpenChange,
  stats,
  total,
  mode,
  onReview,
  onRestart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: ReturnType<typeof scoreResults>;
  total: number;
  mode: QuizMode;
  onReview: () => void;
  onRestart: () => void;
}) {
  const isTest = mode === "test";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isTest ? "Test results" : "Practice complete"}
          </DialogTitle>
          <DialogDescription>
            {isTest
              ? `You answered ${stats.correct} of ${total} questions correctly (${stats.percent}%).`
              : `You reviewed all ${total} questions.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <AnimatedCircularProgressBar
            value={stats.percent}
            gaugePrimaryColor="var(--foreground)"
            gaugeSecondaryColor="var(--muted)"
            className="size-32 text-xl"
          />

          <div className="text-center">
            <p className="text-3xl font-semibold tracking-[-0.6px]">
              {stats.correct}
            </p>
            <p className="text-sm text-muted-foreground">
              of {total} correct ({stats.percent}%)
            </p>
          </div>

          {isTest ? (
            <div className="grid w-full grid-cols-2 gap-3 text-center">
              <ResultStat label="Correct" value={stats.correct} tone="success" />
              <ResultStat
                label="Incorrect"
                value={stats.incorrect + stats.partial + stats.unanswered}
                tone="danger"
              />
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-3 text-center">
              <ResultStat label="Correct" value={stats.correct} tone="success" />
              <ResultStat label="Partial" value={stats.partial} tone="warning" />
              <ResultStat
                label="Incorrect"
                value={stats.incorrect}
                tone="danger"
              />
              <ResultStat
                label="Unanswered"
                value={stats.unanswered}
                tone="muted"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={onReview}>
              {isTest ? "Review answers" : "Keep reviewing"}
            </Button>
            <Button className="flex-1" onClick={onRestart}>
              Start over
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full"
            render={<Link href="/" />}
          >
            Back home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger" | "muted";
}) {
  const toneClass = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-destructive",
    muted: "text-muted-foreground",
  }[tone];

  return (
    <div className="shadow-elevation-2 rounded-lg border border-border bg-[var(--canvas-soft)] p-3">
      <p className={cn("text-2xl font-semibold tracking-[-0.4px]", toneClass)}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
