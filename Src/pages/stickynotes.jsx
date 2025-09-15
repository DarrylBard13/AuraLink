
import React, { useState, useEffect, useCallback } from 'react';
import { StickyNote, User } from '@/api/entities';
import { AnimatePresence } from 'framer-motion';
import StickyNoteCard from '../components/stickynotes/StickyNoteCard';
import PageErrorBoundary from '../components/common/PageErrorBoundary';
import EditStickyNoteDialog from '../components/stickynotes/EditStickyNoteDialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, Layout, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

function StickyNotesContent() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [editingNote, setEditingNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);

  // Collision detection function
  const checkCollision = useCallback((noteId, newGridRow, newGridCol, newRowSpan, newColSpan) => {
    return notes.some(otherNote => {
      if (otherNote.id === noteId) return false; // Don't check against self

      const otherEndRow = (otherNote.gridRow || 1) + (otherNote.rowSpan || 10) - 1;
      const otherEndCol = (otherNote.gridCol || 1) + (otherNote.colSpan || 10) - 1;
      const newEndRow = newGridRow + newRowSpan - 1;
      const newEndCol = newGridCol + newColSpan - 1;

      // Check if rectangles overlap
      return !(newGridRow > otherEndRow ||
               newEndRow < (otherNote.gridRow || 1) ||
               newGridCol > otherEndCol ||
               newEndCol < (otherNote.gridCol || 1));
    });
  }, [notes]); // Re-create if 'notes' changes

  const loadNotes = useCallback(async () => {
    try {
      const activeNotes = await StickyNote.filter({ archived: false });

      const maxCols = 100; // Increased max columns for the smaller grid
      let cursor = { row: 1, col: 1 };
      const positionedNotes = [];
      const grid = {};
      const notesToUpdate = []; // Array to hold notes whose positions need to be saved

      activeNotes.sort((a, b) => {
        const aHasPos = a.gridRow && a.gridCol;
        const bHasPos = b.gridRow && b.gridCol;
        if (aHasPos && !bHasPos) return -1;
        if (!aHasPos && bHasPos) return 1;
        if (a.created_date && b.created_date) {
          return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
        }
        return 0;
      });

      for (const note of activeNotes) {
        let { gridRow, gridCol, rowSpan = 10, colSpan = 10 } = note;

        if (!gridRow || !gridCol) {
            let found = false;
            while(!found) {
                let canPlace = true;
                for (let r = 0; r < rowSpan; r++) {
                    for (let c = 0; c < colSpan; c++) {
                        if (grid[`${cursor.row + r}-${cursor.col + c}`]) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }

                if (canPlace) {
                    gridRow = cursor.row;
                    gridCol = cursor.col;
                    found = true;
                    // Mark this note for a position update
                    notesToUpdate.push({ id: note.id, gridRow, gridCol });
                } else {
                    cursor.col++;
                    if (cursor.col > maxCols) {
                        cursor.col = 1;
                        cursor.row++;
                    }
                }
            }
        }

        for (let r = 0; r < rowSpan; r++) {
            for (let c = 0; c < colSpan; c++) {
                grid[`${gridRow + r}-${gridCol + c}`] = true;
            }
        }

        positionedNotes.push({ ...note, gridRow, gridCol, rowSpan, colSpan });
      }

      // After positioning all notes, save the positions for the new ones
      if (notesToUpdate.length > 0) {
        await Promise.all(
          notesToUpdate.map(update => StickyNote.update(update.id, { gridRow: update.gridRow, gridCol: update.gridCol }))
        );
      }

      setNotes(positionedNotes);
    } catch (error) {
      console.error("Error loading sticky notes:", error);
      toast.error("Failed to load sticky notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  const findNextAvailablePosition = useCallback((rowSpan = 10, colSpan = 10) => {
    if (notes.length === 0) {
      return { gridRow: 1, gridCol: 1 };
    }

    // Find the maximum row number reached by any note
    let maxEndRow = 0;
    notes.forEach(note => {
      // The end row is the starting row plus its height.
      const endRow = (note.gridRow || 1) + (note.rowSpan || 10);
      if (endRow > maxEndRow) {
        maxEndRow = endRow;
      }
    });
    
    // The new note starts at the row right after the last occupied row, in the first column.
    return { gridRow: maxEndRow, gridCol: 1 };
  }, [notes]); // Re-create if 'notes' changes

  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        const currentUser = await User.me();
        setUserRole(currentUser.role || 'user');
        if (currentUser.role === 'admin') {
          await loadNotes();
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to fetch user or notes:", e);
        setLoading(false);
      }
    };
    fetchUserAndNotes();
  }, [loadNotes]);

  const handleArchiveNote = async (noteId) => {
    try {
      await StickyNote.update(noteId, { archived: true });
      toast.success("Note archived!");
      loadNotes();
    } catch (error) {
      console.error("Failed to archive note:", error);
      toast.error("Could not archive note.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await StickyNote.delete(noteId);
      toast.success("Note deleted permanently!");
      loadNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Could not delete note.");
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
  };

  const handleAddNewNote = () => {
    setEditingNote({});
  };

  const handleSaveNote = async (updatedData) => {
    setIsSaving(true);
    try {
      if (editingNote && editingNote.id) {
        // Updating existing note
        await StickyNote.update(editingNote.id, updatedData);
        toast.success("Note updated successfully!");
      } else {
        // Creating new note - find next available position
        const position = findNextAvailablePosition(updatedData.rowSpan || 10, updatedData.colSpan || 10);
        const noteDataWithPosition = {
          ...updatedData,
          gridRow: position.gridRow,
          gridCol: position.gridCol
        };
        await StickyNote.create(noteDataWithPosition);
        toast.success("Note added successfully!");
      }
      setEditingNote(null);
      await loadNotes();
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Could not save note.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNoteLayout = async (noteId, newLayout) => {
    const currentNote = notes.find(note => note.id === noteId);
    if (!currentNote) return;

    const gridRow = newLayout.gridRow ?? currentNote.gridRow;
    const gridCol = newLayout.gridCol ?? currentNote.gridCol;
    const rowSpan = newLayout.rowSpan ?? currentNote.rowSpan;
    const colSpan = newLayout.colSpan ?? currentNote.colSpan;

    // Final collision check before saving
    if (checkCollision(noteId, gridRow, gridCol, rowSpan, colSpan)) {
      toast.error("Cannot move note here - it would overlap with another note.");
      loadNotes(); // Reload to reset visual state
      return;
    }

    // Check grid bounds (grid is 1-indexed, up to 100, so 100 + 1 = 101 is the limit)
    if (gridRow < 1 || gridCol < 1 || gridRow + rowSpan > 101 || gridCol + colSpan > 101) {
      toast.error("Cannot move note outside the grid area.");
      loadNotes(); // Reload to reset visual state
      return;
    }

    try {
      await StickyNote.update(noteId, newLayout);
    } catch (error) {
      console.error(`Failed to save layout for note ${noteId}:`, error);
      toast.error("Failed to save layout change.");
      // On failure, reload notes to revert visual change to the last saved state
      loadNotes();
    }
  };

  // New handler for live preview updates during drag/resize
  const handleLayoutChangePreview = (noteId, newLayout) => {
    const currentNote = notes.find(note => note.id === noteId);
    if (!currentNote) return;

    const gridRow = newLayout.gridRow ?? currentNote.gridRow;
    const gridCol = newLayout.gridCol ?? currentNote.gridCol;
    const rowSpan = newLayout.rowSpan ?? currentNote.rowSpan;
    const colSpan = newLayout.colSpan ?? currentNote.colSpan;

    // Check for collision
    if (checkCollision(noteId, gridRow, gridCol, rowSpan, colSpan)) {
      return; // Don't update if it would cause a collision
    }

    // Ensure note stays within grid bounds (grid is 1-indexed, up to 100, so 100 + 1 = 101 is the limit)
    if (gridRow < 1 || gridCol < 1 || gridRow + rowSpan > 101 || gridCol + colSpan > 101) {
      return; // Don't update if it would go outside grid
    }

    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? { ...note, ...newLayout }
          : note
      )
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading notes...</div>;
  }

  if (userRole !== 'admin') {
    return (
      <div className="p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Development Sticky Notes</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleAddNewNote}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sticky Note
          </Button>
          <Button
            onClick={() => setIsLayoutEditing(!isLayoutEditing)}
            variant="outline"
            className={cn(
              "bg-white/10 border-white/20 text-white hover:bg-white/20 hidden lg:inline-flex",
              isLayoutEditing && "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400"
            )}
          >
            {isLayoutEditing ? <Save className="w-4 h-4 mr-2" /> : <Layout className="w-4 h-4 mr-2" />}
            {isLayoutEditing ? "Done Editing" : "Edit Layout"}
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16 text-white/70">
          <p>No active sticky notes. Add one from the dashboard!</p>
        </div>
      ) : (
        <div
          className="responsive-notes-container"
        >
          <AnimatePresence>
            {notes.map(note => (
              <StickyNoteCard
                key={note.id}
                note={note}
                onArchive={handleArchiveNote}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                isEditingLayout={isLayoutEditing}
                onUpdateLayout={handleUpdateNoteLayout}
                onLayoutChangePreview={handleLayoutChangePreview}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <EditStickyNoteDialog
        note={editingNote}
        isOpen={!!editingNote}
        isSaving={isSaving}
        onClose={() => setEditingNote(null)}
        onSave={handleSaveNote}
      />

      <style jsx>{`
        .responsive-notes-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 1024px) { /* lg breakpoint */
          .responsive-notes-container {
            display: grid;
            grid-template-columns: repeat(100, 20px);
            grid-template-rows: repeat(100, 20px);
            gap: 8px;
            min-height: calc(100vh - 200px);
            padding: 8px;
            overflow-x: hidden;
            overflow-y: visible;
          }
          
          .responsive-notes-container::-webkit-scrollbar { height: 8px; }
          .responsive-notes-container::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
          .responsive-notes-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 4px; }
          .responsive-notes-container::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
        }

        .glass-panel[role="dialog"] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 85vh !important;
          overflow-y: auto !important;
          margin: 0 !important;
          z-index: 9999 !important;
        }

        @media (max-width: 640px) { .glass-panel[role="dialog"] { width: 95vw !important; max-width: 95vw !important; } }
        @media (min-width: 641px) and (max-width: 1024px) { .glass-panel[role="dialog"] { width: 90vw !important; max-width: 90vw !important; } }
        @media (min-width: 1025px) { .glass-panel[role="dialog"] { width: auto !important; max-width: 85vw !important; } }
      `}</style>
    </div>
  );
}

export default function StickyNotesPage() {
  return (
    <PageErrorBoundary pageName="StickyNotes">
      <StickyNotesContent />
    </PageErrorBoundary>
  );
}
