import React from "react";
import { Check, Copy } from "lucide-react";

export const CodeBlock = ({ language, code }: { language?: any; code: any }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-border/40 bg-[#0a0f18] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border/40">
        <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">{language}</span>
        <button type="button" 
          onClick={handleCopy}
          className="text-muted-foreground hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-300">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};
