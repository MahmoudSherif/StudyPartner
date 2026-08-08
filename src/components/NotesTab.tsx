import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/use-mobile'
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
import { useNotes } from '@/hooks/useAppData'
import { newId } from '@/lib/ids'

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
  
  // `loading` distinguishes "this user has no notes" from "the fetch has not
  // come back yet". Seeding on the latter wipes the board -- see the effect below.
  const isMobile = useIsMobile()
  const [notes, setNotes, { loading }] = useNotes()
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

  // Seed a welcome note for genuinely empty boards.
  //
  // This used to destroy data. It keyed off `notes.length === 0` while only
  // depending on `user?.uid`, so it ran the moment a user id existed -- before
  // the remote fetch had resolved, when the collection is empty for every user.
  // It then called `setNotes([welcomeNote])`, a whole-collection replace, so
  // every real note was deleted from the server on load and the board was left
  // holding one hardcoded note. Reloading after writing a note reliably lost it.
  //
  // Three things keep that from happening again: wait for `loading` to finish so
  // empty means empty; append rather than replace; and seed at most once per
  // mount, since `notes` is now a dependency and the write re-runs the effect.
  const seededRef = useRef(false)
  useEffect(() => {
    if (loading || !user?.uid) return
    if (seededRef.current) return
    if (notes.length > 0) { seededRef.current = true; return }

    seededRef.current = true
    const welcomeNote: StickyNote = {
      // A real id: ids must be UUIDs, and 'welcome-note' is not one.
      id: newId(),
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
    setNotes(current => [...current, welcomeNote])
  }, [loading, user?.uid, notes.length, setNotes])

  // Filter notes based on search
  const matchedNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // The desktop board keeps whatever order it gets -- position, not sequence, is
  // what places a note there. The mobile column has no positions, so pinned
  // notes are surfaced first and the rest fall in newest-first order.
  const filteredNotes = isMobile
    ? [...matchedNotes].sort((a, b) => {
        if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    : matchedNotes

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
      id: newId(),
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
          <Plus size={16} className="mr-2" />
          Create Note
        </Button>
      </div>

      {/*
        Two layouts, because a free-form pinboard does not survive a phone.

        Notes carry absolute x/y and a fixed 250x200 size. The board is
        `overflow-hidden`, and on a 390px screen it is roughly 340px wide, so
        any note placed past x≈90 was clipped with no way to reach it -- the
        rest overlapped into an unreadable stack. Dragging to fix that is not
        available either, since the drag competes with touch scrolling.

        So: below `md` the notes flow in a single responsive column, sized by
        their content and ordered pinned-first. At `md` and up the original
        draggable board is unchanged.
      */}
      <div
        ref={boardRef}
        className={
          isMobile
            ? 'space-y-3'
            : 'relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] bg-black/20 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden'
        }
        onMouseMove={isMobile ? undefined : handleDragMove}
        onMouseUp={isMobile ? undefined : handleDragEnd}
        onMouseLeave={isMobile ? undefined : handleDragEnd}
        onTouchMove={isMobile ? undefined : handleTouchMove}
        onTouchEnd={isMobile ? undefined : handleTouchEnd}
        style={isMobile ? undefined : {
          backgroundImage: `
            radial-gradient(circle at 20px 20px, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle at 60px 60px, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px'
        }}
      >
        {filteredNotes.length === 0 ? (
          <div className={isMobile
            ? 'flex items-center justify-center rounded-lg border border-white/10 bg-black/20 py-12 backdrop-blur-md'
            : 'absolute inset-0 flex items-center justify-center'}>
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
                className={
                  isMobile
                    ? 'flex w-full flex-col overflow-hidden rounded-lg select-none'
                    : `absolute cursor-move select-none transition-all duration-200 ${
                        isDragging ? 'z-50 rotate-2 scale-105' : 'z-10 hover:z-20 hover:scale-102'
                      }`
                }
                style={isMobile ? {
                  backgroundColor: note.color,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                } : {
                  left: note.position.x,
                  top: note.position.y,
                  width: note.size.width,
                  height: note.size.height,
                  backgroundColor: note.color,
                  boxShadow: isDragging
                    ? '0 20px 40px rgba(0,0,0,0.4)'
                    : '0 8px 16px rgba(0,0,0,0.2)'
                }}
                onMouseDown={isMobile ? undefined : (e) => handleDragStart(e, note.id)}
                onTouchStart={isMobile ? undefined : (e) => handleTouchStart(e, note.id)}
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

                {/* Move handle: drag only exists on the desktop board. */}
                {!isMobile && (
                  <div className="absolute bottom-1 right-1 opacity-40 hover:opacity-80">
                    <ArrowsOutCardinal size={16} className="text-gray-600" />
                  </div>
                )}
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