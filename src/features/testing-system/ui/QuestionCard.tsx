import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { Tables } from "@/shared/types/database";
import { useTranslation } from "react-i18next";

interface QuestionWithOptions extends Tables<'test_questions'> {
  options: {
    ru: string[];
    kk: string[];
    en: string[];
    values: number[];
  }
}

interface QuestionCardProps {
  question: QuestionWithOptions;
  questionNumber: number;
  totalQuestions: number;
  selectedValue?: number;
  onAnswer: (value: number) => void;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedValue,
  onAnswer
}: QuestionCardProps) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ru' | 'kk' | 'en';

  const questionText = question[`text_${lang}` as keyof typeof question] as string;
  const options = question.options[lang];
  const values = question.options.values;

  return (
    <Card className={cn(
      "p-8 transition-all duration-500 border-border/50 rounded-[2rem] bg-card/40 backdrop-blur-md shadow-xl shadow-primary/5 relative overflow-hidden",
      selectedValue !== undefined && "ring-2 ring-primary/20 border-primary/30"
    )}>
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <h3 className="text-xl font-bold leading-tight flex-1 text-foreground tracking-tight">
            {questionText}
          </h3>
          <Badge variant="outline" className="flex-shrink-0 font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-background/50 border-border/50 rounded-lg">
            {questionNumber} / {totalQuestions}
          </Badge>
        </div>
        
        <RadioGroup
          value={selectedValue?.toString()}
          onValueChange={(value) => onAnswer(parseInt(value))}
        >
          <div className="space-y-2">
            {options.map((option, index) => {
              const value = values[index];
              const isSelected = selectedValue === value;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                    "hover:bg-accent/50 hover:border-border active:scale-[0.98]",
                    isSelected ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg shadow-primary/5" : "border-transparent bg-muted/10"
                  )}
                  onClick={() => onAnswer(value)}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                    isSelected ? "bg-primary border-primary scale-110 shadow-md shadow-primary/30" : "border-muted-foreground/30 bg-background/50"
                  )}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white shadow-sm" />}
                  </div>
                  <span className={cn(
                    "text-base flex-1 transition-all",
                    isSelected ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                  )}>{option}</span>
                </div>
              )
            })}
          </div>
        </RadioGroup>
      </div>
    </Card>
  )
}
