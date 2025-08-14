import React, { useState } from 'react';
import { User, BookOpen, Quote } from 'lucide-react';

interface InspirationFigure {
  id: string;
  name: string;
  occupation: string;
  gender: 'male' | 'female';
  quote: string;
  achievement: string;
  imageUrl?: string;
}

const inspirationalFigures: InspirationFigure[] = [
  {
    id: 'einstein',
    name: 'Albert Einstein',
    occupation: 'Theoretical Physicist',
    gender: 'male',
    quote: 'Imagination is more important than knowledge.',
    achievement: 'Theory of Relativity',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/256px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg'
  },
  {
    id: 'curie',
    name: 'Marie Curie',
    occupation: 'Physicist and Chemist',
    gender: 'female',
    quote: 'Nothing in life is to be feared, it is only to be understood.',
    achievement: 'First woman to win a Nobel Prize'
  },
  {
    id: 'newton',
    name: 'Isaac Newton',
    occupation: 'Mathematician and Physicist',
    gender: 'male',
    quote: 'If I have seen further, it is by standing on the shoulders of giants.',
    achievement: 'Laws of Motion and Universal Gravitation',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/GodfreyKneller-IsaacNewton-1689.jpg/256px-GodfreyKneller-IsaacNewton-1689.jpg'
  },
  {
    id: 'franklin',
    name: 'Rosalind Franklin',
    occupation: 'Chemist',
    gender: 'female',
    quote: 'Science and everyday life cannot and should not be separated.',
    achievement: 'X-ray crystallography of DNA'
  },
  {
    id: 'hawking',
    name: 'Stephen Hawking',
    occupation: 'Theoretical Physicist',
    gender: 'male',
    quote: 'Intelligence is the ability to adapt to change.',
    achievement: 'Black hole research and cosmology',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Stephen_Hawking.StarChild.jpg/256px-Stephen_Hawking.StarChild.jpg'
  },
  {
    id: 'lovelace',
    name: 'Ada Lovelace',
    occupation: 'Mathematician',
    gender: 'female',
    quote: 'That brain of mine is something more than merely mortal; as time will show.',
    achievement: 'First computer programmer'
  },
  {
    id: 'tesla',
    name: 'Nikola Tesla',
    occupation: 'Inventor and Engineer',
    gender: 'male',
    quote: 'The present is theirs; the future, for which I really worked, is mine.',
    achievement: 'AC electrical systems and wireless technology',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N.Tesla.JPG/256px-N.Tesla.JPG'
  },
  {
    id: 'carson',
    name: 'Rachel Carson',
    occupation: 'Marine Biologist',
    gender: 'female',
    quote: 'In every outthrust headland, in every curving beach, in every grain of sand there is the story of the earth.',
    achievement: 'Environmental conservation movement'
  }
];

const BookIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg`}>
    <BookOpen className="w-8 h-8 text-white" />
  </div>
);

const InspirationalFigures: React.FC = () => {
  const [selectedFigure, setSelectedFigure] = useState<InspirationFigure | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Inspirational Figures</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Draw inspiration from the greatest minds in history. Their wisdom, persistence, and achievements light the path for future generations.
        </p>
      </div>

      {/* Figures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {inspirationalFigures.map((figure) => (
          <div
            key={figure.id}
            className="card cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            onClick={() => setSelectedFigure(figure)}
          >
            <div className="text-center space-y-4">
              {/* Profile Picture or Book Icon */}
              <div className="flex justify-center">
                {figure.gender === 'male' && figure.imageUrl ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <img
                      src={figure.imageUrl}
                      alt={figure.name}
                      className="relative w-16 h-16 rounded-full object-cover border-4 border-white/20 shadow-lg group-hover:border-white/40 transition-all"
                      onError={(e) => {
                        // Fallback to generic male icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : figure.gender === 'male' ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white/20 group-hover:border-white/40 transition-all">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <BookIcon className="relative w-16 h-16 border-4 border-white/20 group-hover:border-white/40 transition-all" />
                  </div>
                )}
              </div>

              {/* Name and Occupation */}
              <div>
                <h3 className="font-bold text-lg text-white mb-1">{figure.name}</h3>
                <p className="text-slate-400 text-sm">{figure.occupation}</p>
              </div>

              {/* Quote Preview */}
              <div className="relative">
                <Quote className="w-4 h-4 text-purple-400 absolute -top-2 -left-2" />
                <p className="text-slate-300 text-sm italic line-clamp-2 pl-4">
                  {figure.quote}
                </p>
              </div>

              {/* Click to learn more */}
              <div className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to learn more
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Selected Figure */}
      {selectedFigure && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedFigure(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              {/* Profile Picture or Book Icon - Larger */}
              <div className="flex justify-center">
                {selectedFigure.gender === 'male' && selectedFigure.imageUrl ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-40"></div>
                    <img
                      src={selectedFigure.imageUrl}
                      alt={selectedFigure.name}
                      className="relative w-32 h-32 rounded-full object-cover border-8 border-white/20 shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl border-8 border-white/20">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  </div>
                ) : selectedFigure.gender === 'male' ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-40"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl border-8 border-white/20">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg blur-lg opacity-40"></div>
                    <BookIcon className="relative w-32 h-32 border-8 border-white/20" />
                  </div>
                )}
              </div>

              {/* Name and Occupation */}
              <div>
                <h2 className="font-bold text-3xl text-white mb-2">{selectedFigure.name}</h2>
                <p className="text-slate-400 text-lg">{selectedFigure.occupation}</p>
              </div>

              {/* Quote */}
              <div className="relative bg-purple-900/30 p-6 rounded-xl border border-purple-500/30">
                <Quote className="w-8 h-8 text-purple-400 absolute -top-4 left-6 bg-slate-900 p-1 rounded" />
                <p className="text-white text-lg italic leading-relaxed">
                  "{selectedFigure.quote}"
                </p>
              </div>

              {/* Achievement */}
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/30">
                <h3 className="font-semibold text-white mb-2">Key Achievement</h3>
                <p className="text-slate-300">{selectedFigure.achievement}</p>
              </div>

              {/* Inspiration Message */}
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 p-6 rounded-xl border border-amber-500/30">
                <p className="text-amber-200 italic">
                  Let their legacy inspire your own journey of learning and discovery.
                  Every great achievement started with a single step of curiosity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationalFigures;