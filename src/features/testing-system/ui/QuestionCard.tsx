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
      "p-5 transition-all",
      selectedValue !== undefined && "ring-2 ring-primary"
    )}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-medium leading-relaxed flex-1">
            {questionText}
          </h3>
          <Badge variant="outline" className="ml-4 flex-shrink-0">
            {questionNumber}/{totalQuestions}
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
                    "relative flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                    "hover:bg-accent hover:border-accent-foreground/20 active:scale-[0.99]",
                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-muted"
                  )}
                  onClick={() => onAnswer(value)}
                >
                  <div className={cn(
                    "h-5 w-5 rounded-full border border-primary flex items-center justify-center shrink-0 transition-colors",
                    isSelected && "bg-primary text-primary-foreground"
                  )}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-base flex-1 font-medium">{option}</span>
                </div>
              )
            })}
          </div>
        </RadioGroup>
      </div>
    </Card>
  )
}
