import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, Bot, User as UserIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FunctionDisplay = ({ toolCall }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try {
            return typeof results === 'string' ? JSON.parse(results) : results;
        } catch {
            return results;
        }
    })();
    
    const isError = results && (
        (typeof results === 'string' && /error|failed/i.test(results)) ||
        (parsedResults?.success === false)
    );
    
    const statusConfig = {
        pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
        running: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        in_progress: { icon: Loader2, color: 'text-slate-500', text: 'Running...', spin: true },
        completed: isError ? 
            { icon: AlertCircle, color: 'text-red-500', text: 'Failed' } : 
            { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        success: { icon: CheckCircle2, color: 'text-green-600', text: 'Success' },
        failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
        error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
    }[status] || { icon: Zap, color: 'text-slate-500', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                    "hover:bg-white/5",
                    expanded ? "bg-white/5 border-white/20" : "bg-transparent border-white/10"
                )}
            >
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-white/80">{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-white/60", isError && "text-red-400")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-slate-400 transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-white/10 space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-xs text-white/60 mb-1">Parameters:</div>
                            <pre className="bg-black/20 rounded-md p-2 text-xs text-white/80 whitespace-pre-wrap">
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                                    } catch {
                                        return toolCall.arguments_string;
                                    }
                                })()}
                            </pre>
                        </div>
                    )}
                    {parsedResults && (
                        <div>
                            <div className="text-xs text-white/60 mb-1">Result:</div>
                            <pre className="bg-black/20 rounded-md p-2 text-xs text-white/80 whitespace-pre-wrap max-h-48 overflow-auto">
                                {typeof parsedResults === 'object' ? 
                                    JSON.stringify(parsedResults, null, 2) : parsedResults}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const showBubble = message.content || (message.tool_calls && message.tool_calls.length > 0);

    if (!showBubble) {
        return null;
    }
    
    return (
        <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
            )}
            <div className={cn("max-w-[85%] space-y-2", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isUser 
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" 
                          : "bg-white/10 backdrop-blur-sm text-white"
                    )}>
                        <ReactMarkdown 
                            className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            components={{
                                code: ({ inline, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="relative group/code">
                                            <pre className="bg-black/30 text-white/90 rounded-lg p-3 overflow-x-auto my-2">
                                                <code className={className} {...props}>{children}</code>
                                            </pre>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 bg-white/10 hover:bg-white/20"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                    toast.success('Code copied');
                                                }}
                                            >
                                                <Copy className="h-3 w-3 text-white/70" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <code className="px-1 py-0.5 rounded bg-black/20 text-white/80 text-xs">
                                            {children}
                                        </code>
                                    );
                                },
                                a: ({ children, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">{children}</a>
                                ),
                                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                                ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="my-0.5">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-semibold my-2 text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-semibold my-2 text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold my-2 text-white">{children}</h3>,
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-white/20 pl-3 my-2 text-white/80">
                                        {children}
                                    </blockquote>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
                
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1 w-full">
                        {message.tool_calls.map((toolCall, idx) => (
                            <FunctionDisplay key={idx} toolCall={toolCall} />
                        ))}
                    </div>
                )}
                 <p className="text-xs text-white/50 px-3">
                    {message.created_date ? new Date(message.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
            </div>
             {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
}