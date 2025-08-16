'use client';

import { useState } from 'react';
import type { Quiz } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Award, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizDisplayProps {
  quizData: Quiz;
  topic: string;
}

export function QuizDisplay({ quizData, topic }: QuizDisplayProps) {
  const { quiz } = quizData;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  if (!quiz || quiz.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Quiz Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load quiz questions. Please try generating the quiz again.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quiz[currentQuestionIndex];
  const totalQuestions = quiz.length;

  const handleSelectAnswer = (value: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswers[currentQuestionIndex]) return;

    const selectedOptionText = selectedAnswers[currentQuestionIndex];
    const correctOption = currentQuestion.options.find((opt) => opt.isCorrect);

    if (correctOption && selectedOptionText === correctOption.text) {
      setScore((prev) => prev + 1);
    }
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = () => {
    setIsAnswerChecked(false);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsAnswerChecked(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  if (isQuizFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="items-center text-center">
          <Award className="h-16 w-16 text-yellow-500" />
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg">You scored</p>
          <p className="text-5xl font-bold my-4 text-primary">
            {score} / {totalQuestions}
          </p>
          <p className="text-muted-foreground">
            Great job on the "{topic}" quiz!
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestartQuiz} className="w-full">
            <RotateCw className="mr-2 h-4 w-4" />
            Take Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </CardTitle>
        <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-lg mb-6">{currentQuestion.question}</p>
        <RadioGroup
          value={selectedAnswers[currentQuestionIndex] || ''}
          onValueChange={handleSelectAnswer}
          disabled={isAnswerChecked}
        >
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === option.text;
            const isCorrect = option.isCorrect;
            const showAsCorrect = isAnswerChecked && isCorrect;
            const showAsIncorrect = isAnswerChecked && isSelected && !isCorrect;

            return (
              <Label
                key={index}
                className={cn(
                  "flex items-center gap-4 rounded-md border p-4 transition-colors cursor-pointer hover:bg-accent/50",
                  showAsCorrect && "border-green-500 bg-green-500/10",
                  showAsIncorrect && "border-red-500 bg-red-500/10"
                )}
                htmlFor={`option-${index}`}
              >
                <RadioGroupItem value={option.text} id={`option-${index}`} />
                <span className="flex-1">{option.text}</span>
                {showAsCorrect && <CheckCircle2 className="text-green-500" />}
                {showAsIncorrect && <XCircle className="text-red-500" />}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button
          onClick={isAnswerChecked ? handleNextQuestion : handleCheckAnswer}
          disabled={!selectedAnswers[currentQuestionIndex]}
          className="w-full"
        >
          {isAnswerChecked
            ? currentQuestionIndex === totalQuestions - 1
              ? 'Finish Quiz'
              : 'Next Question'
            : 'Check Answer'}
        </Button>
      </CardFooter>
    </Card>
  );
}
