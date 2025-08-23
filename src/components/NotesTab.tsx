import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  PushPin, 
  PushPinSlash,
  MagnifyingGlass,
  Tag,
  ArrowsOutCardinal,
  ArrowsInCardinal
} from '@phosphor-icons/react'
import { StickyNote } from '@/lib/types'
import { toast } from 'sonner'
import { mobileFeedback } from '@/lib/mobileFeedback'

const NOTE_COLORS = [
  { name: 'Yellow', value: '#fef3c7', dark: '#f59e0b' },
  { name: 'Pink', value: '#fce7f3', dark: '#ec4899' },
  { name: 'Green', value: '#d1fae5', dark: '#10b981' },
  { name: 'Blue', value: '#dbeafe', dark: '#3b82f6' },
  { name: 'Purple', value: '#e9d5ff', dark: '#8b5cf6' },
  { name: 'Orange', value: '#fed7aa', dark: '#f97316' },
  { name: 'Teal', value: '#ccfbf1', dark: '#14b8a6' },
  { name: 'Gray', value: '#f3f4f6', dark: '#6b7280' }
]

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

export function NotesTab() {
  const { user } = useAuth()
  
  // Get user-specific data
  const currentUserId = user?.uid || 'anonymous'
  const userDataKey = (key: string) => `${currentUserId}-${key}`
  
  // Temporarily disabled GitHub Spark KV to prevent rate limit errors
  // TODO: Migrate to Firebase-based notes storage
  const [notes, setNotes] = useState<StickyNote[]>([])
  // const [notes, setNotes] = useKV<StickyNote[]>(userDataKey('sticky-notes'), [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0])
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<StickyNote | null>(null)
  const [draggedNote, setDraggedNote] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const boardRef = useRef<HTMLDivElement>(null)
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  })

  // Initialize notes with random positions if empty
  useEffect(() => {
    try {
      if (notes.length === 0) {
        const welcomeNote: StickyNote = {
          id: 'welcome-note',
          title: 'Welcome to Notes! 📝',
          content: 'This is your digital sticky note board. Create, organize, and manage your thoughts and ideas here!',
          color: NOTE_COLORS[0].value,
          position: { x: 20, y: 20 },
          size: { width: 250, height: 200 },
          createdAt: new Date(),
          updatedAt: new Date(),
          isPinned: true,
          tags: ['welcome', 'tutorial']
        }
        setNotes([welcomeNote])
      }
    } catch (error) {
      // Error handling for production
      // Don't show user error for initialization
    }
  }, [])

  // Filter notes based on search
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get random position for new notes
  const getRandomPosition = (): Position => {
    const boardWidth = boardRef.current?.clientWidth || 400
    const boardHeight = boardRef.current?.clientHeight || 600
    
    return {
      x: Math.random() * (boardWidth - 250),
      y: Math.random() * (boardHeight - 200)
    }
  }

  // Add new note
  const addNote = () => {
    if (!newNote.title.trim()) {
      toast.error('Please enter a note title')
      return
    }

    const note: StickyNote = {
      id: Date.now().toString(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      color: selectedColor.value,
      position: getRandomPosition(),
      size: { width: 250, height: 200 },
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      tags: newNote.tags ? newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    }

    setNotes(current => [...current, note])
    setNewNote({ title: '', content: '', tags: '' })
    setShowAddNote(false)
    mobileFeedback.buttonPress()
    toast.success('Note added!')
  }

  // Update note
  const updateNote = (noteId: string, updates: Partial<StickyNote>) => {
    setNotes(current => 
      current.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    )
  }

  // Delete note
  const deleteNote = (noteId: string) => {
    setNotes(current => current.filter(note => note.id !== noteId))
    setEditingNote(null)
    toast.success('Note deleted')
  }

  // Toggle pin
  const togglePin = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      updateNote(noteId, { isPinned: !note.isPinned })
      mobileFeedback.buttonPress()
    }
  }

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault()
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setDraggedNote(noteId)
  }

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggedNote || !boardRef.current) return

    e.preventDefault()
    const boardRect = boardRef.current.getBoundingClientRect()
    
    const newPosition = {
      x: Math.max(0, Math.min(
        e.clientX - boardRect.left - dragOffset.x,
        boardRect.width - 250
      )),
      y: Math.max(0, Math.min(
        e.clientY - boardRect.top - dragOffset.y,
        boardRect.height - 200
      ))
    }

    updateNote(draggedNote, { position: newPosition })
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedNote(null)
    setDragOffset({ x: 0, y: 0 })
  }

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent, noteId: string) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    })
    setDraggedNote(noteId)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedNote || !boardRef.current) return

    e.preventDefault()
    const touch = e.touches[0]
    const boardRect = boardRef.current.getBoundingClientRect()
    
    const newPosition = {
      x: Math.max(0, Math.min(
        touch.clientX - boardRect.left - dragOffset.x,
        boardRect.width - 250
      )),
      y: Math.max(0, Math.min(
        touch.clientY - boardRect.top - dragOffset.y,
        boardRect.height - 200
      ))
    }

    updateNote(draggedNote, { position: newPosition })
  }

  const handleTouchEnd = () => {
    setDraggedNote(null)
    setDragOffset({ x: 0, y: 0 })
  }

  return (
    <div className="space-y-4 h-full">
      {/* Search and Add Controls */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <Button
          onClick={() => setShowAddNote(true)}
          className="bg-accent hover:bg-accent/80 text-accent-foreground"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Notes Board */}
      <div 
        ref={boardRef}
        className="relative min-h-[600px] bg-black/20 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 20px 20px, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle at 60px 60px, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px'
        }}
      >
        {filteredNotes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-white font-medium mb-2">No notes yet</h3>
              <p className="text-white/60 mb-4">Create your first sticky note to get started</p>
              <Button
                onClick={() => setShowAddNote(true)}
                className="bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                <Plus size={16} className="mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        ) : (
          filteredNotes.map(note => {
            const colorConfig = NOTE_COLORS.find(c => c.value === note.color) || NOTE_COLORS[0]
            const isDragging = draggedNote === note.id
            
            return (
              <div
                key={note.id}
                className={`absolute cursor-move select-none transition-all duration-200 ${
                  isDragging ? 'z-50 rotate-2 scale-105' : 'z-10 hover:z-20 hover:scale-102'
                }`}
                style={{
                  left: note.position.x,
                  top: note.position.y,
                  width: note.size.width,
                  height: note.size.height,
                  backgroundColor: note.color,
                  boxShadow: isDragging 
                    ? '0 20px 40px rgba(0,0,0,0.4)' 
                    : '0 8px 16px rgba(0,0,0,0.2)'
                }}
                onMouseDown={(e) => handleDragStart(e, note.id)}
                onTouchStart={(e) => handleTouchStart(e, note.id)}
              >
                {/* Note Header */}
                <div className="p-3 border-b border-black/10">
                  <div className="flex items-start justify-between">
                    <h3 
                      className="font-semibold text-gray-800 flex-1 mr-2 line-clamp-2"
                      style={{ color: colorConfig.dark }}
                    >
                      {note.title}
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePin(note.id)
                        }}
                        className={`h-6 w-6 p-0 hover:bg-black/10 ${
                          note.isPinned ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {note.isPinned ? <PushPin size={12} /> : <PushPinSlash size={12} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingNote(note)
                        }}
                        className="h-6 w-6 p-0 text-gray-600 hover:bg-black/10"
                      >
                        <PencilSimple size={12} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Note Content */}
                <div className="p-3 flex-1 overflow-hidden">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-6">
                    {note.content}
                  </p>
                </div>

                {/* Note Footer */}
                {note.tags && note.tags.length > 0 && (
                  <div className="p-2 border-t border-black/10">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-black/10 text-gray-600 hover:bg-black/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-black/10 text-gray-600">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Move Handle */}
                <div className="absolute bottom-1 right-1 opacity-40 hover:opacity-80">
                  <ArrowsOutCardinal size={16} className="text-gray-600" />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Note</DialogTitle>
            <DialogDescription className="text-white/70">
              Add a new note to organize your thoughts and ideas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            
            <Textarea
              placeholder="Note content"
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none h-32"
            />
            
            <Input
              placeholder="Tags (comma separated)"
              value={newNote.tags}
              onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />

            {/* Color Picker */}
            <div className="space-y-2">
              <label className="text-sm text-white/80">Note Color</label>
              <div className="grid grid-cols-4 gap-2">
                {NOTE_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color)}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      selectedColor.value === color.value 
                        ? 'border-white scale-110' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddNote(false)}
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Cancel
              </Button>
              <Button
                onClick={addNote}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                Create Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="bg-black/90 backdrop-blur-md border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Note</DialogTitle>
              <DialogDescription className="text-white/70">
                Make changes to your note
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title"
                value={editingNote.title}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              
              <Textarea
                placeholder="Note content"
                value={editingNote.content}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none h-32"
              />
              
              <Input
                placeholder="Tags (comma separated)"
                value={editingNote.tags?.join(', ') || ''}
                onChange={(e) => setEditingNote(prev => prev ? { 
                  ...prev, 
                  tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
                } : null)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditingNote(null)}
                  variant="outline"
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteNote(editingNote.id)}
                  variant="outline"
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                >
                  <Trash size={16} />
                </Button>
                <Button
                  onClick={() => {
                    updateNote(editingNote.id, {
                      title: editingNote.title,
                      content: editingNote.content,
                      tags: editingNote.tags
                    })
                    setEditingNote(null)
                    toast.success('Note updated!')
                  }}
                  className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}