import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { TestQuestion } from '@/shared/types/database';
import { useTranslation } from 'react-i18next';

interface TestQuestionOptionsProps {
  question: TestQuestion;
  testType: string;
  onAnswer: (questionId: string, value: number | string) => void;
  currentAnswer?: number | string;
}

export const TestQuestionOptions = ({ question, testType, onAnswer, currentAnswer }: TestQuestionOptionsProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'ru' | 'kk' | 'en';

  if (!question.options || typeof question.options !== 'object') {
    return <div>Invalid options format</div>;
  }

  const options = (question.options as any)[currentLanguage];
  const values = (question.options as any).values;

  if (!options || !values || options.length !== values.length) {
    return <div>Options or values are missing for the current language.</div>;
  }

  return (
    <RadioGroup
      onValueChange={(value) => onAnswer(question.id, values[options.indexOf(value)])}
      value={options[values.indexOf(currentAnswer)]}
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
