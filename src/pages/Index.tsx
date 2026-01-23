import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import UploadZone from '@/components/UploadZone';
import ResultPanel from '@/components/ResultPanel';

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [digitizedText, setDigitizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(URL.createObjectURL(file));
      const base64Data = (reader.result as string).split(',')[1];
      setBase64Image(base64Data);
      setDigitizedText('');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImage(null);
    setBase64Image(null);
    setDigitizedText('');
    setError(null);
  };

  const digitizeText = async () => {
    if (!base64Image) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('digitize-text', {
        body: { imageBase64: base64Image }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to process image');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.text) {
        setDigitizedText(data.text);
        toast({
          title: "Success!",
          description: "Text has been digitized successfully.",
        });
      } else {
        throw new Error('No text was extracted from the image');
      }
    } catch (err) {
      console.error('Digitization error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-warm">
      <div className="min-h-screen p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <Header />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Upload */}
            <section className="space-y-5">
              <UploadZone
                image={image}
                onFileSelect={handleFileSelect}
                onReset={handleReset}
              />

              <button
                disabled={!image || isLoading}
                onClick={digitizeText}
                className="btn-primary shadow-soft hover:shadow-lifted"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Digitize Text
                  </>
                )}
              </button>
            </section>

            {/* Right Column: Result */}
            <section className="flex flex-col">
              <ResultPanel
                text={digitizedText}
                isLoading={isLoading}
                error={error}
              />
              
              <p className="mt-4 text-xs text-muted-foreground text-center px-4">
                Tip: For best results, ensure good lighting and keep the document flat.
              </p>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-16 text-center">
            <p className="text-xs text-muted-foreground">
              Preserving memories, one document at a time.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
