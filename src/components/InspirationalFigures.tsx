import React, { useRef, useEffect } from 'react';
import { User, BookOpen, Quote, Award } from 'lucide-react';

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
  // Islamic Scholars and Figures (prioritized)
  {
    id: 'ibn-sina',
    name: 'Ibn Sina (Avicenna)',
    occupation: 'Physician, Philosopher, Scientist',
    gender: 'male',
    quote: 'The knowledge of anything, since all things have causes, is not acquired or complete unless it is known by its causes.',
    achievement: 'Father of modern medicine, wrote influential medical texts'
  },
  {
    id: 'al-khwarizmi',
    name: 'Al-Khwarizmi',
    occupation: 'Mathematician, Astronomer',
    gender: 'male',
    quote: 'Restoration is the return of things to their natural state.',
    achievement: 'Father of Algebra, developed algorithms and decimal system'
  },
  {
    id: 'ibn-rushd',
    name: 'Ibn Rushd (Averroes)',
    occupation: 'Philosopher, Physician, Polymath',
    gender: 'male',
    quote: 'Ignorance leads to fear, fear leads to hatred, and hatred leads to violence.',
    achievement: 'Influential Islamic philosopher, bridge between Islamic and Christian thought'
  },
  {
    id: 'al-razi',
    name: 'Al-Razi',
    occupation: 'Physician, Alchemist, Philosopher',
    gender: 'male',
    quote: 'Truth in medicine is an unattainable goal, and the art as described in books is far beneath the knowledge of an experienced physician.',
    achievement: 'Distinguished smallpox from measles, pioneer in medical ethics'
  },
  {
    id: 'ibn-khaldun',
    name: 'Ibn Khaldun',
    occupation: 'Historian, Sociologist, Economist',
    gender: 'male',
    quote: 'Geography is destiny.',
    achievement: 'Father of sociology and historiography, developed theories of social cohesion'
  },
  {
    id: 'fatima-al-fihri',
    name: 'Fatima al-Fihri',
    occupation: 'Scholar, Founder',
    gender: 'female',
    quote: 'Seek knowledge from the cradle to the grave.',
    achievement: 'Founded the University of al-Qarawiyyin, world\'s oldest operating university'
  },
  // Other Notable Figures
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
  }
];

const BookIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg`}>
    <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
  </div>
);

const InspirationalFigures: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect - scrolls every 7 seconds
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollInterval: number;
    
    const scroll = () => {
      const cardHeight = 300; // Approximate height of each card including margins
      const currentScroll = scrollContainer.scrollTop;
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      
      if (currentScroll >= maxScroll) {
        // Reset to top smoothly
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll to next card
        scrollContainer.scrollTo({ 
          top: currentScroll + cardHeight, 
          behavior: 'smooth' 
        });
      }
    };

    // Scroll every 7 seconds (7000ms)
    scrollInterval = setInterval(scroll, 7000) as any;

    return () => {
      clearInterval(scrollInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Inspirational Figures</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Draw inspiration from the greatest minds in history, with special focus on Islamic scholars. Their wisdom, persistence, and achievements light the path for future generations.
        </p>
      </div>

      {/* Auto-scrolling Figures Gallery */}
      <div className="card p-0">
        <div className="p-4 bg-slate-800/60 rounded-t-lg ring-1 ring-white/10">
          <span className="text-sm text-slate-400">🔄 Auto-scrolling inspiration gallery</span>
        </div>
        
        <div
          ref={scrollContainerRef}
          className="p-3 sm:p-4 overflow-y-auto h-96 sm:h-[600px]"
        >
          <div className="space-y-6">
            {inspirationalFigures.map((figure) => (
              <div
                key={figure.id}
                className="card transform transition-all duration-300 hover:scale-102 hover:shadow-2xl group bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 border-slate-600/30 hover:border-purple-400/50"
              >
                <div className="flex flex-col lg:flex-row gap-6 p-6">
                  {/* Profile Picture or Icon */}
                  <div className="flex justify-center lg:justify-start flex-shrink-0">
                    {figure.gender === 'male' && figure.imageUrl ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                        <img
                          src={figure.imageUrl}
                          alt={figure.name}
                          className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white/20 shadow-lg group-hover:border-white/40 transition-all"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                        </div>
                      </div>
                    ) : figure.gender === 'male' ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white/20 group-hover:border-white/40 transition-all">
                          <User className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                        <BookIcon className="relative w-20 h-20 lg:w-24 lg:h-24 border-4 border-white/20 group-hover:border-white/40 transition-all" />
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-4 text-center lg:text-left">
                    {/* Name and Occupation */}
                    <div>
                      <h3 className="font-bold text-xl lg:text-2xl text-white mb-2">{figure.name}</h3>
                      <p className="text-slate-400 text-base lg:text-lg">{figure.occupation}</p>
                    </div>

                    {/* Quote */}
                    <div className="relative bg-purple-900/30 p-4 lg:p-5 rounded-xl border border-purple-500/30">
                      <Quote className="w-6 h-6 text-purple-400 absolute -top-3 left-4 bg-slate-900 p-1 rounded" />
                      <p className="text-white text-base lg:text-lg italic leading-relaxed pl-2">
                        "{figure.quote}"
                      </p>
                    </div>

                    {/* Achievement */}
                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 lg:p-5 rounded-xl border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white text-base lg:text-lg">Key Achievement</h4>
                      </div>
                      <p className="text-slate-300 text-sm lg:text-base leading-relaxed">{figure.achievement}</p>
                    </div>

                    {/* Special indicator for Islamic scholars */}
                    {['ibn-sina', 'al-khwarizmi', 'ibn-rushd', 'al-razi', 'ibn-khaldun', 'fatima-al-fihri'].includes(figure.id) && (
                      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 p-3 rounded-lg border border-amber-500/30">
                        <p className="text-amber-200 text-sm lg:text-base text-center lg:text-left">
                          🌟 Islamic Scholar - Pioneer of Knowledge
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspiration Message */}
      <div className="card bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30">
        <p className="text-amber-200 italic text-center text-base lg:text-lg leading-relaxed">
          Let their legacy inspire your own journey of learning and discovery.
          Every great achievement started with a single step of curiosity and dedication to knowledge.
        </p>
      </div>
    </div>
  );
};

export default InspirationalFigures;