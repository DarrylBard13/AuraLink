
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Eye, Edit, Check, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import MarkdownCheatSheet from './MarkdownCheatSheet';

const NOTE_COLORS = ["yellow", "pink", "blue", "green", "purple"];

const colorVariants = {
  yellow: "bg-yellow-400",
  pink: "bg-pink-400", 
  blue: "bg-blue-400",
  green: "bg-green-400",
  purple: "bg-purple-400",
};

export default function EditStickyNoteDialog({ note, isOpen, isSaving, onClose, onSave }) {
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [previewMode, setPreviewMode] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  
  const isNewNote = !note || !note.id;

  useEffect(() => {
    if (note) {
      setContent(note.content || '');
      setColor(note.color || 'yellow');
    } else {
      setContent('');
      setColor('yellow');
    }
  }, [note]);

  const handleSave = () => {
    const noteData = {
      content,
      color,
      // Preserve existing dimensions or set defaults for new notes
      rowSpan: note?.rowSpan || 10,
      colSpan: note?.colSpan || 10,
      gridRow: note?.gridRow, // Let the auto-layout on the page handle new notes
      gridCol: note?.gridCol,
    };
    onSave(noteData);
  };

  const handleClose = () => {
    setPreviewMode(false);
    setShowCheatSheet(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="glass-panel text-white border-white/20 max-w-2xl w-[95vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{isNewNote ? "Add New Sticky Note" : "Edit Sticky Note"}</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCheatSheet(true)}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white"
                  title="Markdown Help"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Button>
                <Button
                  onClick={() => setPreviewMode(!previewMode)}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white"
                >
                  {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {previewMode ? (
              <div className={cn(
                "min-h-[200px] p-4 rounded-lg bg-gradient-to-br relative",
                color === 'yellow' && "from-yellow-300 to-amber-400",
                color === 'pink' && "from-pink-300 to-rose-400", 
                color === 'blue' && "from-blue-300 to-cyan-400",
                color === 'green' && "from-green-300 to-lime-400",
                color === 'purple' && "from-purple-300 to-violet-400"
              )}>
                <ReactMarkdown 
                  className={cn(
                    "prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                    color === 'yellow' && "text-yellow-900",
                    color === 'pink' && "text-rose-900",
                    color === 'blue' && "text-cyan-900", 
                    color === 'green' && "text-lime-900",
                    color === 'purple' && "text-violet-900"
                  )}
                  components={{
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-3">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-3">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-current pl-4 my-3 italic opacity-80">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, children }) => {
                      return inline ? (
                        <code className="px-2 py-1 rounded bg-black/20 text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-black/20 rounded p-3 my-3 overflow-x-auto text-sm font-mono">
                          <code>{children}</code>
                        </pre>
                      );
                    },
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    hr: () => <hr className="my-4 border-current opacity-50" />,
                    table: ({ children }) => (
                      <table className="border-collapse border border-current my-3 text-sm w-full">
                        {children}
                      </table>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-black/10">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody>
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="border border-current">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className="border border-current px-2 py-1 font-semibold text-left">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-current px-2 py-1">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {content || '*No content to preview*'}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Enter your note content here... You can use markdown formatting:

# Header
- List item
**Bold text**
*Italic text*

Click the Help button for more formatting options!`}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[300px] resize-y focus:ring-yellow-500 focus:border-yellow-500"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Color</label>
                  <div className="flex gap-3">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center",
                          colorVariants[c],
                          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        )}
                      >
                        {color === c && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/60">
                  Markdown formatting supported: headers (#), lists (- or 1.), **bold**, *italic*, `code`, &gt; quotes, and more.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleClose}
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MarkdownCheatSheet 
        isOpen={showCheatSheet} 
        onClose={() => setShowCheatSheet(false)} 
      />
    </>
  );
}
