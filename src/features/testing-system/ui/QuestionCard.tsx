import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
      "p-6 transition-all",
      selectedValue !== undefined && "ring-2 ring-primary"
    )}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium leading-relaxed flex-1">
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
                <label
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    "hover:bg-accent hover:border-accent-foreground/20",
                    isSelected && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={value.toString()} id={`q${questionNumber}-${index}`} />
                  <span className="text-base flex-1">{option}</span>
                </label>
              )
            })}
          </div>
        </RadioGroup>
      </div>
    </Card>
  )
}
