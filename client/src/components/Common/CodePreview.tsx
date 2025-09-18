import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodePreviewProps {
  code: string;
  language: string;
  className?: string;
}

export default function CodePreview({ code, language, className = "" }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const highlightSyntax = (code: string, lang: string) => {
    // Simple syntax highlighting for JSON
    if (lang === 'json') {
      return code
        .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1":</span>')
        .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
        .replace(/: (\d+\.?\d*)/g, ': <span class="text-yellow-400">$1</span>')
        .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>');
    }
    
    // Simple syntax highlighting for JavaScript
    if (lang === 'javascript') {
      return code
        .replace(/\b(import|export|from|const|let|var|function|class|if|else|for|while|return|try|catch|throw)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/'([^']+)'/g, '<span class="text-green-400">\'$1\'</span>')
        .replace(/"([^"]+)"/g, '<span class="text-green-400">"$1"</span>')
        .replace(/\/\/.*$/gm, '<span class="text-gray-500">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500">$&</span>');
    }

    return code;
  };

  return (
    <div className={`relative syntax-highlight rounded-lg ${className}`} data-testid="code-preview">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 px-2"
          data-testid="button-copy-code"
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          <code 
            dangerouslySetInnerHTML={{ 
              __html: highlightSyntax(code, language) 
            }}
          />
        </pre>
      </div>
    </div>
  );
}
