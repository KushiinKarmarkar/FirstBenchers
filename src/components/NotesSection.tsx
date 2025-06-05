import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Home } from "lucide-react";

interface NotesSectionProps {
  onNavigate: (page: string) => void;
}

const subjects = [
  { id: "english", name: "English", chapters: ["A Letter to God", "Nelson Mandela: Long Walk to Freedom", "Two Stories about Flying"] },
  { id: "hindi", name: "Hindi", chapters: ["सूरदास के पद", "राम-लक्ष्मण-परशुराम संवाद", "सवैया और कवित्त"] },
  { id: "science", name: "Science", chapters: ["Light: Reflection and Refraction", "Carbon and its Compounds", "Life Processes"] },
  { id: "math", name: "Mathematics", chapters: ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables"] },
  { id: "social", name: "Social Science", chapters: ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of Global World"] },
  { id: "it", name: "Information Technology", chapters: ["Introduction to IT", "Digital Documentation", "Electronic Spreadsheet"] }
];

export const NotesSection = ({ onNavigate }: NotesSectionProps) => {
  const [currentView, setCurrentView] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Study Notes</h1>
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
                <BookOpen className="h-5 w-5" />
                <span>{subject.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">{subject.chapters.length} chapters available</p>
              <div className="flex flex-wrap gap-2">
                {subject.chapters.slice(0, 2).map((chapter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {chapter.substring(0, 20)}...
                  </Badge>
                ))}
                {subject.chapters.length > 2 && (
                  <Badge variant="outline">+{subject.chapters.length - 2} more</Badge>
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
          <h1 className="text-3xl font-bold text-gray-800">{selectedSubject?.name} Notes</h1>
        </div>
        <Button onClick={() => onNavigate("dashboard")} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      <div className="grid gap-4">
        {selectedSubject?.chapters.map((chapter: string, index: number) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            setSelectedChapter(chapter);
            setCurrentView("chapter");
          }}>
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{chapter}</h3>
                <p className="text-gray-600">Click to view detailed notes</p>
              </div>
              <Button>View Notes</Button>
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
          <h1 className="text-3xl font-bold text-gray-800">{selectedChapter}</h1>
        </div>
        <Button onClick={() => onNavigate("dashboard")} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedChapter}</CardTitle>
          <Badge className="w-fit">{selectedSubject?.name}</Badge>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-700">Introduction</h3>
            <p className="text-gray-700 leading-relaxed">
              This chapter covers the fundamental concepts and important topics related to {selectedChapter}. 
              The content has been carefully structured according to the curriculum to help you understand 
              the key concepts effectively.
            </p>

            <h3 className="text-xl font-semibold text-blue-700">Key Points</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Important concept related to this chapter</li>
              <li>Key formulas and definitions to remember</li>
              <li>Critical examples and case studies</li>
              <li>Practice problems and their solutions</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-700">Important Questions</h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-medium">💡 Tip: Make sure to practice the questions at the end of each chapter for better understanding.</p>
            </div>

            <h3 className="text-xl font-semibold text-blue-700">Summary</h3>
            <p className="text-gray-700 leading-relaxed">
              This chapter is crucial for your board exams. Focus on understanding the concepts rather than 
              just memorizing. Practice regularly and refer to NCERT textbooks for additional examples.
            </p>
          </div>
        </CardContent>
      </Card>
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
