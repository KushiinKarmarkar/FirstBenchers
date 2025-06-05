import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Award } from "lucide-react";

interface DailyQuizProps {
  onComplete: (points: number) => void;
  onClose: () => void;
}

const quizQuestions = [
  {
    question: "What is the chemical formula of water?",
    options: ["H2O", "CO2", "NaCl", "CaCO3"],
    correct: 0,
    subject: "Science"
  },
  {
    question: "Who wrote 'A Letter to God'?",
    options: ["R.K. Narayan", "G.L. Fuentes", "Roald Dahl", "Jerome K. Jerome"],
    correct: 1,
    subject: "English"
  },
  {
    question: "What is the value of π (pi) approximately?",
    options: ["3.14", "2.71", "1.41", "1.73"],
    correct: 0,
    subject: "Mathematics"
  },
  {
    question: "Which year did India gain independence?",
    options: ["1945", "1947", "1948", "1950"],
    correct: 1,
    subject: "Social Science"
  },
  {
    question: "What is the unit of electric current?",
    options: ["Volt", "Ampere", "Ohm", "Watt"],
    correct: 1,
    subject: "Science"
  }
];

export const DailyQuiz = ({ onComplete, onClose }: DailyQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Quiz completed
        const score = newAnswers.reduce((acc, answer, index) => {
          return acc + (answer === quizQuestions[index].correct ? 1 : 0);
        }, 0);
        setShowResult(true);
      }
    }
  };

  const calculateScore = () => {
    return answers.reduce((acc, answer, index) => {
      return acc + (answer === quizQuestions[index].correct ? 1 : 0);
    }, 0);
  };

  const getPoints = (score: number) => {
    return score * 20; // 20 points per correct answer
  };

  if (showResult) {
    const score = calculateScore();
    const points = getPoints(score);
    
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <Award className="h-8 w-8 text-yellow-500" />
              <span>Quiz Completed!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold text-green-600">{score}/{quizQuestions.length}</div>
            <p className="text-xl text-gray-600">You scored {score} out of {quizQuestions.length} questions!</p>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">🎉 Points Earned: {points}</p>
            </div>

            <div className="space-y-2">
              {quizQuestions.map((q, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{q.subject} - Q{index + 1}</span>
                  {answers[index] === q.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>

            <Button onClick={() => onComplete(points)} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={onClose}>← Back</Button>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daily Quiz</CardTitle>
            <Badge>{question.subject}</Badge>
          </div>
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-medium">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className="w-full justify-start h-auto p-4 text-left"
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                    {selectedAnswer === index && <div className="w-3 h-3 rounded-full bg-white"></div>}
                  </div>
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>

          <Button 
            onClick={handleNext} 
            disabled={selectedAnswer === null}
            className="w-full"
          >
            {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
