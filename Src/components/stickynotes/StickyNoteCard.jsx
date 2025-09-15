
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Archive, Edit, Pin, GripIcon, Move, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const GRID_CELL_SIZE = 20;
const GRID_GAP_SIZE = 8;
const UNIT_SIZE = GRID_CELL_SIZE + GRID_GAP_SIZE;

const colorVariants = {
  yellow: {
    gradient: "from-yellow-300 to-amber-400",
    border: "border-yellow-200",
    pin: "text-yellow-800/50",
    prose: "prose-yellow",
    text: "text-yellow-900",
    textMuted: "text-yellow-800/70",
    button: "text-yellow-800",
    buttonHover: "hover:bg-yellow-200/50",
    resizeHandle: "bg-yellow-600/30 hover:bg-yellow-600/50",
    dragHandle: "bg-yellow-600/30 hover:bg-yellow-600/50",
  },
  pink: {
    gradient: "from-pink-300 to-rose-400",
    border: "border-pink-200",
    pin: "text-rose-800/50",
    prose: "prose-rose",
    text: "text-rose-900",
    textMuted: "text-rose-800/70",
    button: "text-rose-800",
    buttonHover: "hover:bg-rose-200/50",
    resizeHandle: "bg-rose-600/30 hover:bg-rose-600/50",
    dragHandle: "bg-rose-600/30 hover:bg-rose-600/50",
  },
  blue: {
    gradient: "from-blue-300 to-cyan-400",
    border: "border-blue-200",
    pin: "text-cyan-800/50",
    prose: "prose-cyan",
    text: "text-cyan-900",
    textMuted: "text-cyan-800/70",
    button: "text-cyan-800",
    buttonHover: "hover:bg-cyan-200/50",
    resizeHandle: "bg-cyan-600/30 hover:bg-cyan-600/50",
    dragHandle: "bg-cyan-600/30 hover:bg-cyan-600/50",
  },
  green: {
    gradient: "from-green-300 to-lime-400",
    border: "border-green-200",
    pin: "text-lime-800/50",
    prose: "prose-lime",
    text: "text-lime-900",
    textMuted: "text-lime-800/70",
    button: "text-lime-800",
    buttonHover: "hover:bg-lime-200/50",
    resizeHandle: "bg-lime-600/30 hover:bg-lime-600/50",
    dragHandle: "bg-lime-600/30 hover:bg-lime-600/50",
  },
  purple: {
    gradient: "from-purple-300 to-violet-400",
    border: "border-purple-200",
    pin: "text-violet-800/50",
    prose: "prose-violet",
    text: "text-violet-900",
    textMuted: "text-violet-800/70",
    button: "text-violet-800",
    buttonHover: "hover:bg-violet-200/50",
    resizeHandle: "bg-violet-600/30 hover:bg-violet-600/50",
    dragHandle: "bg-violet-600/30 hover:bg-violet-600/50",
  },
};

// A custom component to handle text rendering, including strikethrough
const TextRenderer = ({ children }) => {
  if (!children) return null;

  // Normalize children to an array to iterate over all of them
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {childrenArray.map((child, i) => {
        if (typeof child === 'string') {
          // Split the string by the strikethrough syntax, keeping the delimiters
          const parts = child.split(/(~~.*?~~)/g);
          return parts.map((part, index) => {
            if (part.startsWith('~~') && part.endsWith('~~')) {
              // Render as <del> if it's a strikethrough part
              return <del key={`${i}-${index}`} className="opacity-75">{part.substring(2, part.length - 2)}</del>;
            }
            // Render other string parts as is (wrapped in a span for consistent keying)
            return <span key={`${i}-${index}`}>{part}</span>;
          });
        }
        // If it's not a string (e.g., a React element like <strong>, <em>), render as is.
        // Use React.Fragment to avoid unnecessary DOM elements, and ensure proper keying.
        return <React.Fragment key={i}>{child}</React.Fragment>;
      })}
    </>
  );
};

export default function StickyNoteCard({ note, onArchive, onEdit, onDelete, isEditingLayout, onUpdateLayout, onLayoutChangePreview }) {
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startLayout = useRef(null);

  const handleArchive = () => {
    if (isEditingLayout) return;
    onArchive(note.id);
  };

  const handleEdit = () => {
    if (isEditingLayout) return;
    onEdit(note);
  };

  const handleDelete = () => {
    if (isEditingLayout) return;
    if (window.confirm(`Are you sure you want to permanently delete this note? This action cannot be undone.`)) {
      onDelete(note.id);
    }
  };

  const handleInteractionStart = (e, type) => {
    if (!isEditingLayout) return;
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    startPos.current = { x: clientX, y: clientY };
    startLayout.current = {
      rowSpan: note.rowSpan,
      colSpan: note.colSpan,
      gridRow: note.gridRow,
      gridCol: note.gridCol,
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = type === 'resize' ? 'nwse-resize' : 'grabbing';

    const handleInteractionMove = (moveEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      const moveClientX = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = moveClientX - startPos.current.x;
      const deltaY = moveClientY - startPos.current.y;
      
      let newLayout = {};

      if (type === 'resize') {
          const colSpanChange = Math.round(deltaX / UNIT_SIZE);
          const rowSpanChange = Math.round(deltaY / UNIT_SIZE);
          newLayout.colSpan = Math.max(4, startLayout.current.colSpan + colSpanChange);
          newLayout.rowSpan = Math.max(4, startLayout.current.rowSpan + rowSpanChange);
      } else if (type === 'drag') {
          const colChange = Math.round(deltaX / UNIT_SIZE);
          const rowChange = Math.round(deltaY / UNIT_SIZE);
          newLayout.gridCol = Math.max(1, startLayout.current.gridCol + colChange);
          newLayout.gridRow = Math.max(1, startLayout.current.gridRow + rowChange);
      }
      onLayoutChangePreview(note.id, newLayout);
    };

    const handleInteractionEnd = () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      document.removeEventListener('mousemove', handleInteractionMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchmove', handleInteractionMove);
      document.removeEventListener('touchend', handleInteractionEnd);
      
      const finalLayout = {
          gridRow: cardRef.current ? parseInt(cardRef.current.style.gridRowStart) : note.gridRow,
          gridCol: cardRef.current ? parseInt(cardRef.current.style.gridColumnStart) : note.gridCol,
          rowSpan: cardRef.current ? parseInt(cardRef.current.style.gridRowEnd.replace('span ', '')) : note.rowSpan,
          colSpan: cardRef.current ? parseInt(cardRef.current.style.gridColumnEnd.replace('span ', '')) : note.colSpan,
      };
      
      const updatedFields = {};
      if (note.gridRow !== finalLayout.gridRow) updatedFields.gridRow = finalLayout.gridRow;
      if (note.gridCol !== finalLayout.gridCol) updatedFields.gridCol = finalLayout.gridCol;
      if (note.rowSpan !== finalLayout.rowSpan) updatedFields.rowSpan = finalLayout.rowSpan;
      if (note.colSpan !== finalLayout.colSpan) updatedFields.colSpan = finalLayout.colSpan;

      if (Object.keys(updatedFields).length > 0) {
        onUpdateLayout(note.id, updatedFields);
      }
    };

    document.addEventListener('mousemove', handleInteractionMove);
    document.addEventListener('mouseup', handleInteractionEnd);
    document.addEventListener('touchmove', handleInteractionMove, { passive: false });
    document.addEventListener('touchend', handleInteractionEnd);
  };

  const colors = colorVariants[note.color] || colorVariants.yellow;

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-4 rounded-2xl bg-gradient-to-br shadow-xl border-t-2 flex flex-col z-0",
        colors.gradient,
        colors.border,
      )}
      style={{
        gridRow: `${note.gridRow} / span ${note.rowSpan}`,
        gridColumn: `${note.gridCol} / span ${note.colSpan}`,
        touchAction: 'none',
      }}
    >
      <Pin className={cn("absolute top-2 right-2 w-6 h-6 transform -rotate-45", colors.pin, isEditingLayout && 'hidden')} />
      
      {isEditingLayout && (
        <div
          onMouseDown={(e) => handleInteractionStart(e, 'drag')}
          onTouchStart={(e) => handleInteractionStart(e, 'drag')}
          className={cn(
            "absolute top-1 left-1 p-1 rounded-full cursor-grab active:cursor-grabbing transition-all",
            colors.dragHandle
          )}
        >
            <Move className="w-4 h-4 opacity-70" />
        </div>
      )}

      <div className="flex-1 mb-3 overflow-hidden">
        <ReactMarkdown 
          className={cn(
            "text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
            colors.prose,
            colors.text
          )}
          components={{
            h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-semibold mb-1">{children}</h2>,
            p: ({ children }) => <p className="mb-1 leading-relaxed"><TextRenderer>{children}</TextRenderer></p>,
            ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-0.5"><TextRenderer>{children}</TextRenderer></li>,
            blockquote: ({ children }) => (
              <blockquote className={cn("border-l-2 pl-3 my-2 italic", colors.border, colors.textMuted)}>
                <TextRenderer>{children}</TextRenderer>
              </blockquote>
            ),
            code: ({ inline, children }) => {
              return inline ? (
                <code className="px-1 py-0.5 rounded bg-black/10 text-xs font-mono">
                  {children}
                </code>
              ) : (
                <pre className="bg-black/10 rounded p-2 my-2 overflow-x-auto text-xs font-mono">
                  <code>{children}</code>
                </pre>
              );
            },
            hr: () => <hr className={cn("my-2", colors.border)} />,
            table: ({ children }) => (
              <table className="border-collapse border border-current my-2 text-xs w-full">
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
              <th className="border border-current px-1 py-0.5 font-semibold text-left text-xs">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-current px-1 py-0.5 text-xs">
                {children}
              </td>
            ),
          }}
        >
          {note.content || ''}
        </ReactMarkdown>
      </div>

      <div className={cn("flex items-center justify-between mt-auto pt-2 border-t", colors.border)}>
        <p className={cn("text-xs", colors.textMuted)}>
          {format(new Date(note.created_date), 'MMM d, yyyy')}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 text-red-600 hover:text-red-500 hover:bg-red-100/20", colors.buttonHover)}
            disabled={isEditingLayout}
            title="Delete note permanently"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            onClick={handleArchive}
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", colors.button, colors.buttonHover)}
            disabled={isEditingLayout}
            title="Archive note"
          >
            <Archive className="w-3 h-3" />
          </Button>
          <Button
            onClick={handleEdit}
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", colors.button, colors.buttonHover)}
            disabled={isEditingLayout}
            title="Edit note"
          >
            <Edit className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {isEditingLayout && (
        <div
          onMouseDown={(e) => handleInteractionStart(e, 'resize')}
          onTouchStart={(e) => handleInteractionStart(e, 'resize')}
          className={cn(
            "absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize rounded-tl-lg rounded-br-2xl",
            "flex items-center justify-center transition-all duration-200",
            "hover:scale-110 active:scale-125",
            colors.resizeHandle,
          )}
          title="Drag to resize"
        >
          <GripIcon className="w-3 h-3 opacity-70" />
        </div>
      )}
    </motion.div>
  );
}
