"use client";

import {
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Check,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonStepperProps {
  currentStep: number; // 0 = not started, 1-4 = step in progress
  completedAt: boolean;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, label: "Dastlabki Test", icon: ClipboardCheck },
  { step: 2, label: "Maruzalar", icon: BookOpen },
  { step: 3, label: "Vaziyatli Savol-Javob", icon: MessageSquare },
  { step: 4, label: "Yakuniy Test", icon: GraduationCap },
];

function getStepStatus(
  step: number,
  currentStep: number,
  completedAt: boolean
): "completed" | "current" | "locked" {
  if (completedAt) return "completed";
  if (step < currentStep) return "completed";
  if (step === currentStep) return "current";
  return "locked";
}

export function LessonStepper({
  currentStep,
  completedAt,
  onStepClick,
}: LessonStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop horizontal */}
      <div className="hidden sm:flex items-start justify-between">
        {STEPS.map((s, idx) => {
          const status = getStepStatus(s.step, currentStep, completedAt);
          const Icon = s.icon;
          const isClickable = status !== "locked" && onStepClick;

          return (
            <div key={s.step} className="flex flex-1 items-start">
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(s.step)}
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
                    status === "completed" &&
                      "border-green-500 bg-green-50 text-green-600",
                    status === "current" &&
                      "border-blue-500 bg-blue-50 text-blue-600 ring-4 ring-blue-100",
                    status === "locked" &&
                      "border-muted bg-muted/50 text-muted-foreground cursor-not-allowed",
                    isClickable && "hover:scale-105 cursor-pointer"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="h-5 w-5" />
                  ) : status === "locked" ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </button>
                <p
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[100px]",
                    status === "completed" && "text-green-700",
                    status === "current" && "text-blue-700",
                    status === "locked" && "text-muted-foreground"
                  )}
                >
                  {s.label}
                </p>
              </div>
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 pt-6 px-2">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded-full",
                      getStepStatus(s.step + 1, currentStep, completedAt) !== "locked"
                        ? "bg-green-400"
                        : "bg-muted"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical */}
      <div className="sm:hidden space-y-0">
        {STEPS.map((s, idx) => {
          const status = getStepStatus(s.step, currentStep, completedAt);
          const Icon = s.icon;
          const isClickable = status !== "locked" && onStepClick;

          return (
            <div key={s.step} className="flex items-stretch">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(s.step)}
                  className={cn(
                    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    status === "completed" &&
                      "border-green-500 bg-green-50 text-green-600",
                    status === "current" &&
                      "border-blue-500 bg-blue-50 text-blue-600 ring-4 ring-blue-100",
                    status === "locked" &&
                      "border-muted bg-muted/50 text-muted-foreground cursor-not-allowed",
                    isClickable && "hover:scale-105 cursor-pointer"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : status === "locked" ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[24px]",
                      getStepStatus(s.step + 1, currentStep, completedAt) !== "locked"
                        ? "bg-green-400"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="ml-3 pb-8">
                <p
                  className={cn(
                    "text-sm font-medium pt-2",
                    status === "completed" && "text-green-700",
                    status === "current" && "text-blue-700",
                    status === "locked" && "text-muted-foreground"
                  )}
                >
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {status === "completed" && "Tugatilgan"}
                  {status === "current" && "Hozirgi qadam"}
                  {status === "locked" && "Qulflangan"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
