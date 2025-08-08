import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Plus, 
  Trash2, 
  Search, 
  BookOpen, 
  Tag,
  Calendar,
  Filter
} from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const { state, addQuestion, deleteQuestion } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    category: '',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.question.trim() && newQuestion.answer.trim()) {
      addQuestion({
        question: newQuestion.question.trim(),
        answer: newQuestion.answer.trim(),
        category: newQuestion.category.trim(),
        tags: newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      setNewQuestion({ question: '', answer: '', category: '', tags: '' });
      setShowAddForm(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(state.questions.map(q => q.category).filter(Boolean)))];

  const filteredQuestions = state.questions
    .filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Knowledge Base</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn"
        >
          <Plus size={18} />
          Add Question
        </button>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question *
              </label>
              <textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder="Enter your study question..."
                className="textarea"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer *
              </label>
              <textarea
                value={newQuestion.answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                placeholder="Enter the answer..."
                className="textarea"
                rows={5}
                required
              />
            </div>

            <div className="grid grid-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  placeholder="e.g., Mathematics, Physics, History"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                  placeholder="e.g., calculus, derivatives, limits"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn">
                Add Question
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0 sm:min-w-[300px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions, answers, or tags..."
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No questions found' : 'No questions yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first study question to get started!'
              }
            </p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div key={question.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {question.question}
                  </h3>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {question.answer}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 transition-colors ml-4"
                  title="Delete question"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  {question.category && (
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {question.category}
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {format(new Date(question.createdAt), 'MMM do, yyyy')}
                  </span>
                </div>
                
                {question.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag size={14} />
                    <div className="flex gap-1">
                      {question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default KnowledgeBase;