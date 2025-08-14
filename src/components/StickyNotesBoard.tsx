import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, AlertCircle, Circle, Minus, RotateCcw } from 'lucide-react';
import { generateId } from '../utils/storage';

interface StickyNote {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  position: { x: number; y: number };
  createdAt: string;
  color: string;
}

const StickyNotesBoard: React.FC = () => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', priority: 'medium' as const });
  const [editNote, setEditNote] = useState<{ title: string; content: string; priority: 'low' | 'medium' | 'high' | 'urgent' }>({ title: '', content: '', priority: 'medium' });

  // Priority colors that look good on brown board
  const priorityColors = {
    low: '#90EE90',      // Light Green
    medium: '#FFE135',   // Yellow  
    high: '#FF8C69',     // Salmon
    urgent: '#FF6B6B'    // Red
  };

  const priorityIcons = {
    low: Circle,
    medium: Minus,
    high: AlertCircle,
    urgent: AlertCircle
  };

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('stickyNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: StickyNote = {
      id: generateId(),
      title: newNote.title,
      content: newNote.content,
      priority: newNote.priority as 'low' | 'medium' | 'high' | 'urgent',
      position: {
        x: Math.random() * 300 + 50, // Random position on board
        y: Math.random() * 200 + 50
      },
      createdAt: new Date().toISOString(),
      color: priorityColors[newNote.priority]
    };

    setNotes(prev => [...prev, note]);
    setNewNote({ title: '', content: '', priority: 'medium' });
    setIsAddingNote(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const updateNote = (id: string) => {
    if (!editNote.title.trim() || !editNote.content.trim()) return;

    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { 
            ...note, 
            title: editNote.title, 
            content: editNote.content, 
            priority: editNote.priority,
            color: priorityColors[editNote.priority]
          }
        : note
    ));
    setEditingNote(null);
  };

  const startEditing = (note: StickyNote) => {
    setEditingNote(note.id);
    setEditNote({ 
      title: note.title, 
      content: note.content, 
      priority: note.priority
    });
  };

  const clearAllNotes = () => {
    if (confirm('Are you sure you want to clear all notes?')) {
      setNotes([]);
    }
  };

  const moveNote = (id: string, deltaX: number, deltaY: number) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { 
            ...note, 
            position: { 
              x: Math.max(0, Math.min(600, note.position.x + deltaX)),
              y: Math.max(0, Math.min(400, note.position.y + deltaY))
            }
          }
        : note
    ));
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            📌 Sticky Notes Board
          </h1>
          <p className="text-xl text-gray-400">
            Organize your thoughts on a virtual cork board with color-coded priorities
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setIsAddingNote(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add New Note
          </button>

          {notes.length > 0 && (
            <button
              onClick={clearAllNotes}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
            >
              <RotateCcw className="w-5 h-5" />
              Clear All Notes
            </button>
          )}
        </div>

        {/* Priority Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(priorityColors).map(([priority, color]) => {
            const Icon = priorityIcons[priority as keyof typeof priorityIcons];
            return (
              <div key={priority} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20">
                <Icon 
                  className="w-4 h-4" 
                  style={{ color }} 
                />
                <span className="capitalize text-sm">{priority} Priority</span>
              </div>
            );
          })}
        </div>

        {/* Cork Board */}
        <div 
          className="relative w-full rounded-3xl border-8 border-amber-800 shadow-2xl overflow-hidden"
          style={{
            minHeight: '600px',
            background: `
              radial-gradient(circle at 20% 20%, #8B4513 0%, #A0522D 25%, #8B4513 50%),
              radial-gradient(circle at 80% 80%, #CD853F 0%, #D2B48C 25%, #CD853F 50%),
              linear-gradient(45deg, #8B4513 0%, #A0522D 25%, #CD853F 50%, #D2B48C 75%, #8B4513 100%)
            `,
            backgroundSize: '100px 100px, 150px 150px, 200px 200px',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          {/* Cork Board Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(circle at 10% 10%, transparent 8px, rgba(139, 69, 19, 0.3) 8px, rgba(139, 69, 19, 0.3) 10px, transparent 10px),
                radial-gradient(circle at 90% 20%, transparent 6px, rgba(160, 82, 45, 0.3) 6px, rgba(160, 82, 45, 0.3) 8px, transparent 8px),
                radial-gradient(circle at 30% 80%, transparent 7px, rgba(205, 133, 63, 0.3) 7px, rgba(205, 133, 63, 0.3) 9px, transparent 9px)
              `,
              backgroundSize: '80px 80px, 120px 120px, 100px 100px'
            }}
          ></div>

          {/* Sticky Notes */}
          {notes.map((note) => {
            const PriorityIcon = priorityIcons[note.priority];
            return (
              <div
                key={note.id}
                className="absolute transform hover:scale-105 transition-transform duration-200 group cursor-move"
                style={{
                  left: `${note.position.x}px`,
                  top: `${note.position.y}px`,
                  transform: `rotate(${Math.random() * 10 - 5}deg)`, // Slight random rotation
                }}
                draggable
                onDragEnd={(e) => {
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (rect) {
                    const deltaX = e.clientX - rect.left - note.position.x;
                    const deltaY = e.clientY - rect.top - note.position.y;
                    moveNote(note.id, deltaX, deltaY);
                  }
                }}
              >
                <div
                  className="w-48 min-h-48 p-4 shadow-lg transform hover:shadow-xl transition-shadow duration-200"
                  style={{
                    backgroundColor: note.color,
                    boxShadow: `
                      0 4px 8px rgba(0,0,0,0.2),
                      0 6px 20px rgba(0,0,0,0.1),
                      inset 0 0 0 1px rgba(255,255,255,0.1)
                    `,
                    transform: 'perspective(1000px) rotateX(5deg)',
                  }}
                >
                  {/* Note Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PriorityIcon className="w-4 h-4 text-gray-700" />
                      <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                        {note.priority}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 hover:bg-black/10 rounded"
                        title="Edit note"
                      >
                        <Edit2 className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 hover:bg-black/10 rounded"
                        title="Delete note"
                      >
                        <X className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <input
                        value={editNote.title}
                        onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-transparent border-b border-gray-600 pb-1 text-gray-800 font-bold text-sm placeholder-gray-600 focus:outline-none"
                        placeholder="Note title"
                        autoFocus
                      />
                      <textarea
                        value={editNote.content}
                        onChange={(e) => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full bg-transparent text-gray-700 text-sm resize-none focus:outline-none placeholder-gray-600"
                        placeholder="Note content"
                        rows={4}
                      />
                      <select
                        value={editNote.priority}
                        onChange={(e) => setEditNote(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full bg-transparent text-gray-700 text-xs border border-gray-600 rounded px-2 py-1"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => updateNote(note.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNote(null)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">
                        {note.title}
                      </h3>
                      <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  )}

                  {/* Note Footer */}
                  <div className="mt-3 pt-2 border-t border-gray-600/20">
                    <div className="text-xs text-gray-600">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty Board Message */}
          {notes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-amber-800 opacity-50">
                <div className="text-6xl mb-4">📌</div>
                <p className="text-xl font-medium">Your cork board is empty</p>
                <p className="text-sm mt-2">Click "Add New Note" to start organizing your thoughts!</p>
              </div>
            </div>
          )}
        </div>

        {/* Add Note Modal */}
        {isAddingNote && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add New Sticky Note</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Enter note title"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Enter note content"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newNote.priority}
                    onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low Priority (Green)</option>
                    <option value="medium">Medium Priority (Yellow)</option>
                    <option value="high">High Priority (Orange)</option>
                    <option value="urgent">Urgent (Red)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addNote}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg transition-colors font-medium"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => setIsAddingNote(false)}
                    className="flex-1 border border-white/20 hover:bg-white/10 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyNotesBoard;