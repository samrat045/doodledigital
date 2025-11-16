import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { TextDisplay } from "@/components/TextDisplay";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
    setExtractedText("");
  };

  const handleReset = () => {
    setSelectedImage(null);
    setExtractedText("");
  };

  const handleDigitize = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('digitize-handwriting', {
        body: { image: selectedImage }
      });

      if (error) throw error;

      if (data?.text) {
        setExtractedText(data.text);
        toast.success('Text extracted successfully!');
      } else {
        throw new Error('No text was extracted from the image');
      }
    } catch (error: any) {
      console.error('Error digitizing handwriting:', error);
      toast.error(error.message || 'Failed to extract text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Handwriting Digitizer</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Convert your handwritten notes to digital text with AI-powered OCR
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ImageUploader
              onImageSelect={handleImageSelect}
              onReset={handleReset}
              selectedImage={selectedImage}
            />
            {selectedImage && !extractedText && (
              <Button
                onClick={handleDigitize}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Digitize Handwriting'
                )}
              </Button>
            )}
          </div>

          {extractedText && (
            <TextDisplay text={extractedText} onTextChange={setExtractedText} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
