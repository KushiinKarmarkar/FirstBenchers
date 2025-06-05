import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuizQuestions } from '@/hooks/useQuizQuestions';
import { Upload, FileText, AlertCircle } from 'lucide-react';

export const AdminPanel = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { isAdmin, uploadCSVQuestions } = useQuizQuestions();

  if (!isAdmin) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </CardContent>
      </Card>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const success = await uploadCSVQuestions(selectedFile);
    if (success) {
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>Admin Panel - Quiz Questions Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">CSV Format Requirements</h3>
            <p className="text-blue-700 text-sm mb-2">
              Your CSV file must contain the following columns in this exact order:
            </p>
            <code className="bg-blue-100 px-2 py-1 rounded text-xs">
              question,option_a,option_b,option_c,option_d,correct_option,subject
            </code>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• <strong>correct_option:</strong> Must be 0, 1, 2, or 3 (corresponding to options A, B, C, D)</li>
              <li>• <strong>subject:</strong> Subject category (e.g., "Science", "Mathematics", "English")</li>
              <li>• All fields are required</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
                Upload CSV File
              </label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 text-sm">
                  Selected file: <strong>{selectedFile.name}</strong>
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
