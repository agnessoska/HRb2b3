import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Database } from '@/shared/types/database';
import { useTranslation } from 'react-i18next';

type TestQuestion = Database['public']['Tables']['test_questions']['Row'];

interface TestQuestionOptionsProps {
  question: TestQuestion;
  onAnswer: (questionId: string, value: number | string) => void;
  currentAnswer?: number | string;
}

interface QuestionOptions {
  ru: string[];
  kk: string[];
  en: string[];
  values: (number | string)[];
}

export const TestQuestionOptions = ({ question, onAnswer, currentAnswer }: TestQuestionOptionsProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'ru' | 'kk' | 'en';

  if (!question.options || typeof question.options !== 'object') {
    return <div>Invalid options format</div>;
  }

  const questionOptions = question.options as unknown as QuestionOptions;
  const options = questionOptions[currentLanguage];
  const values = questionOptions.values;

  if (!options || !values || options.length !== values.length) {
    return <div>Options or values are missing for the current language.</div>;
  }

  return (
    <RadioGroup
      onValueChange={(value) => onAnswer(question.id, values[options.indexOf(value)])}
      value={currentAnswer !== undefined ? options[values.indexOf(currentAnswer)] : undefined}
      className="space-y-2"
    >
      {options.map((option: string, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={`${question.id}-${index}`} />
          <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
        </div>
      ))}
    </RadioGroup>
  );
};
