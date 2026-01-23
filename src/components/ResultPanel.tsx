import React, { useState } from 'react';
import { Copy, Check, ImageIcon } from 'lucide-react';

interface ResultPanelProps {
  text: string;
  isLoading: boolean;
  error: string | null;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ text, isLoading, error }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="result-panel min-h-[400px] flex-1">
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Digitized Content
        </span>
        {text && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 p-1.5 rounded-md hover:bg-primary/5 transition-colors"
          >
            {copied ? (
              <>
                <Check size={16} className="text-success" />
                <span className="text-success">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-card/90 backdrop-blur-sm z-10">
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-primary rounded-full loading-bar" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse-subtle">
              Analyzing text patterns...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20 mb-4 fade-in">
            {error}
          </div>
        )}

        {/* Result Text */}
        {text ? (
          <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-mono text-sm fade-in">
            {text}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 text-center min-h-[200px]">
            <ImageIcon size={48} strokeWidth={1} className="mb-3 opacity-50" />
            <p className="text-sm">Processed text will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
