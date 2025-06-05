import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowLeft, Home } from "lucide-react";

interface QASectionProps {
  onNavigate: (page: string) => void;
}

const subjects = [
  { 
    id: "english", 
    name: "English", 
    chapters: [
      { name: "A Letter to God", questions: 8 },
      { name: "Nelson Mandela: Long Walk to Freedom", questions: 12 },
      { name: "Two Stories about Flying", questions: 6 }
    ]
  },
  { 
    id: "science", 
    name: "Science", 
    chapters: [
      { name: "Light: Reflection and Refraction", questions: 15 },
      { name: "Carbon and its Compounds", questions: 18 },
      { name: "Life Processes", questions: 20 }
    ]
  },
  { 
    id: "math", 
    name: "Mathematics", 
    chapters: [
      { name: "Real Numbers", questions: 10 },
      { name: "Polynomials", questions: 14 },
      { name: "Pair of Linear Equations", questions: 16 }
    ]
  }
];

const sampleQuestions = [
  {
    type: "Short Answer",
    question: "What does Coorgs tradition of hospitality mean?",
    answer: "Coorg's tradition of hospitality refers to the warm and welcoming nature of the Kodagu people. They are known for their generosity and kindness towards guests, making visitors feel at home with their traditional customs and practices."
  },
  {
    type: "Long Answer", 
    question: "Explain the process of photosynthesis in detail.",
    answer: "Photosynthesis is the process by which green plants make their own food using sunlight, carbon dioxide, and water. The process occurs in two stages: Light reactions (occurring in thylakoids) where light energy is converted to chemical energy, and Dark reactions (Calvin cycle in stroma) where CO2 is fixed to form glucose. The overall equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2 + 6H2O."
  }
];

export const QASection = ({ onNavigate }: QASectionProps) => {
  const [currentView, setCurrentView] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Practice Questions & Answers</h1>
        <Button onClick={() => onNavigate("dashboard")} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            setSelectedSubject(subject);
            setCurrentView("subject");
          }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{subject.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">{subject.chapters.length} chapters with questions</p>
              <div className="space-y-2">
                {subject.chapters.slice(0, 2).map((chapter, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{chapter.name.substring(0, 20)}...</span>
                    <Badge variant="secondary">{chapter.questions}Q</Badge>
                  </div>
                ))}
                {subject.chapters.length > 2 && (
                  <Badge variant="outline">+{subject.chapters.length - 2} more chapters</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSubject = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setCurrentView("overview")} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">{selectedSubject?.name} Q&A</h1>
        </div>
        <Button onClick={() => onNavigate("dashboard")} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      <div className="grid gap-4">
        {selectedSubject?.chapters.map((chapter: any, index: number) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            setSelectedChapter(chapter);
            setCurrentView("chapter");
          }}>
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{chapter.name}</h3>
                <p className="text-gray-600">{chapter.questions} practice questions available</p>
              </div>
              <Button>View Questions</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderChapter = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setCurrentView("subject")} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">{selectedChapter?.name}</h1>
        </div>
        <Button onClick={() => onNavigate("dashboard")} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      <div className="space-y-6">
        {sampleQuestions.map((qa, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{qa.question}</CardTitle>
                <Badge variant={qa.type === "Short Answer" ? "default" : "secondary"}>
                  {qa.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Answer:</h4>
                <p className="text-green-700 leading-relaxed">{qa.answer}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="bg-blue-50">
          <CardContent className="p-6 text-center">
            <p className="text-blue-800 font-medium">More questions coming soon! 📚</p>
            <p className="text-blue-600">We're constantly adding new practice questions for better preparation.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {currentView === "overview" && renderOverview()}
      {currentView === "subject" && renderSubject()}
      {currentView === "chapter" && renderChapter()}
    </div>
  );
};
