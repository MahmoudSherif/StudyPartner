import React, { useState } from 'react';
import { ArrowLeft, Book, Trophy, Lightbulb, Globe, Star, Heart } from 'lucide-react';

interface Figure {
  id: string;
  name: string;
  title: string;
  era: string;
  category: string;
  image: string;
  achievements: string[];
  quote: string;
  story: string;
  impact: string[];
  isIslamic?: boolean;
}

const InspirationalFigures: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);

  const figures: Figure[] = [
    {
      id: 'einstein',
      name: 'Albert Einstein',
      title: 'Theoretical Physicist',
      era: '1879-1955',
      category: 'science',
      image: '🧠',
      achievements: [
        'Developed the Theory of Relativity',
        'Nobel Prize in Physics (1921)',
        'E=mc² equation',
        'Photoelectric effect explanation',
        'Founded modern theoretical physics'
      ],
      quote: 'Imagination is more important than knowledge.',
      story: 'Albert Einstein revolutionized our understanding of space, time, and gravity. Despite struggling with traditional education methods, his curiosity and persistence led to discoveries that changed the world.',
      impact: [
        'Modern GPS systems use his relativity theory',
        'Nuclear energy applications',
        'Space exploration calculations',
        'Quantum physics foundations'
      ]
    },
    {
      id: 'ibn-sina',
      name: 'Ibn Sina (Avicenna)',
      title: 'Philosopher & Physician',
      era: '980-1037 CE',
      category: 'science',
      image: '🏥',
      achievements: [
        'Wrote "The Canon of Medicine"',
        'Father of modern medicine',
        'Discovered contagious diseases',
        'Advanced surgical techniques',
        'Philosophical contributions to logic'
      ],
      quote: 'The knowledge of anything, since all things have causes, is not acquired or complete unless it is known by its causes.',
      story: 'Ibn Sina was a Persian polymath who made groundbreaking contributions to medicine, philosophy, and science during the Islamic Golden Age. His medical encyclopedia was used in European universities for over 600 years.',
      impact: [
        'Modern medical diagnosis methods',
        'Pharmaceutical preparations',
        'Clinical trials concept',
        'Quarantine procedures'
      ],
      isIslamic: true
    },
    {
      id: 'marie-curie',
      name: 'Marie Curie',
      title: 'Physicist & Chemist',
      era: '1867-1934',
      category: 'science',
      image: '🔬',
      achievements: [
        'First woman to win Nobel Prize',
        'Only person to win Nobel in two sciences',
        'Discovered radium and polonium',
        'Pioneered radioactivity research',
        'Founded mobile X-ray units'
      ],
      quote: 'In science, we must be interested in things, not in persons.',
      story: 'Marie Curie broke barriers as a woman in science, conducting groundbreaking research on radioactivity. Her dedication and scientific rigor opened doors for future generations of women scientists.',
      impact: [
        'Cancer treatment development',
        'Medical imaging advances',
        'Nuclear physics research',
        'Women\'s rights in academia'
      ]
    },
    {
      id: 'al-khwarizmi',
      name: 'Al-Khwarizmi',
      title: 'Mathematician & Astronomer',
      era: '780-850 CE',
      category: 'mathematics',
      image: '📐',
      achievements: [
        'Father of Algebra',
        'Introduced Hindu-Arabic numerals',
        'Developed algorithmic thinking',
        'Advanced astronomical calculations',
        'Created detailed world maps'
      ],
      quote: 'That fondness for science, that affability and condescension which God shows to the learned, that promptitude with which he protects and supports them.',
      story: 'Al-Khwarizmi laid the foundations of modern mathematics and computer science. His work on algebra and algorithms became the basis for mathematical education worldwide.',
      impact: [
        'Modern computer algorithms',
        'Mathematical problem solving',
        'Engineering calculations',
        'Scientific computation'
      ],
      isIslamic: true
    },
    {
      id: 'leonardo-da-vinci',
      name: 'Leonardo da Vinci',
      title: 'Renaissance Polymath',
      era: '1452-1519',
      category: 'art',
      image: '🎨',
      achievements: [
        'Mona Lisa and The Last Supper',
        'Engineering and architectural designs',
        'Anatomical studies',
        'Flying machine concepts',
        'Scientific observation methods'
      ],
      quote: 'Learning never exhausts the mind.',
      story: 'Leonardo da Vinci embodied the Renaissance ideal of combining art and science. His curiosity knew no bounds, leading to innovations in art, engineering, anatomy, and design.',
      impact: [
        'Modern art techniques',
        'Engineering design principles',
        'Scientific illustration',
        'Innovation methodology'
      ]
    },
    {
      id: 'ibn-rushd',
      name: 'Ibn Rushd (Averroes)',
      title: 'Philosopher & Judge',
      era: '1126-1198 CE',
      category: 'philosophy',
      image: '⚖️',
      achievements: [
        'Commentaries on Aristotle',
        'Reconciled reason and faith',
        'Legal and philosophical writings',
        'Influenced European scholasticism',
        'Promoted scientific thinking'
      ],
      quote: 'Ignorance leads to fear, fear leads to hatred, and hatred leads to violence.',
      story: 'Ibn Rushd was a brilliant Islamic philosopher who defended the use of reason in understanding religious truths. His works influenced both Islamic and Christian thought for centuries.',
      impact: [
        'Modern philosophical thought',
        'Religious tolerance concepts',
        'Legal reasoning methods',
        'Educational philosophy'
      ],
      isIslamic: true
    },
    {
      id: 'nelson-mandela',
      name: 'Nelson Mandela',
      title: 'Anti-Apartheid Leader',
      era: '1918-2013',
      category: 'leadership',
      image: '✊',
      achievements: [
        'Ended apartheid in South Africa',
        'First Black President of South Africa',
        'Nobel Peace Prize (1993)',
        '27 years imprisonment for justice',
        'Promoted reconciliation over revenge'
      ],
      quote: 'Education is the most powerful weapon which you can use to change the world.',
      story: 'Nelson Mandela spent 27 years in prison for his fight against apartheid, emerging to lead South Africa\'s peaceful transition to democracy. His commitment to reconciliation inspired the world.',
      impact: [
        'Human rights movements globally',
        'Peaceful conflict resolution',
        'Democratic transitions',
        'Racial equality progress'
      ]
    },
    {
      id: 'fatima-al-fihri',
      name: 'Fatima al-Fihri',
      title: 'Educator & Founder',
      era: '800-880 CE',
      category: 'education',
      image: '🏛️',
      achievements: [
        'Founded the University of al-Qarawiyyin',
        'Established the world\'s oldest university',
        'Promoted higher education',
        'Created endowments for learning',
        'Pioneered women\'s education leadership'
      ],
      quote: 'Knowledge is a treasure that follows its owner everywhere.',
      story: 'Fatima al-Fihri used her inheritance to establish the University of al-Qarawiyyin in Morocco, which became a center of learning that attracted scholars from across the world and continues operating today.',
      impact: [
        'Modern university system',
        'Higher education for all',
        'Scholarship and research',
        'Women\'s educational leadership'
      ],
      isIslamic: true
    },
    {
      id: 'steve-jobs',
      name: 'Steve Jobs',
      title: 'Technology Innovator',
      era: '1955-2011',
      category: 'technology',
      image: '📱',
      achievements: [
        'Co-founded Apple Inc.',
        'Revolutionized personal computing',
        'Created the iPhone and iPad',
        'Transformed multiple industries',
        'Pioneered user-friendly design'
      ],
      quote: 'Stay hungry. Stay foolish.',
      story: 'Steve Jobs transformed how we interact with technology, making complex devices simple and beautiful. His vision for user experience changed computing, phones, and digital media forever.',
      impact: [
        'Smartphone revolution',
        'Digital media transformation',
        'Design thinking principles',
        'Technology accessibility'
      ]
    },
    {
      id: 'malala',
      name: 'Malala Yousafzai',
      title: 'Education Activist',
      era: '1997-Present',
      category: 'education',
      image: '📚',
      achievements: [
        'Youngest Nobel Prize laureate',
        'Global education advocacy',
        'Survived assassination attempt',
        'Malala Fund for girls\' education',
        'UN Messenger of Peace'
      ],
      quote: 'One child, one teacher, one book, one pen can change the world.',
      story: 'Malala Yousafzai stood up for girls\' education in Pakistan, surviving an assassination attempt by the Taliban. She continues to fight for educational rights worldwide.',
      impact: [
        'Girls\' education awareness',
        'Global activism inspiration',
        'Educational policy changes',
        'Youth empowerment movement'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Figures', icon: Globe },
    { id: 'science', name: 'Science', icon: Lightbulb },
    { id: 'mathematics', name: 'Mathematics', icon: Book },
    { id: 'art', name: 'Arts', icon: Star },
    { id: 'philosophy', name: 'Philosophy', icon: Book },
    { id: 'leadership', name: 'Leadership', icon: Trophy },
    { id: 'education', name: 'Education', icon: Book },
    { id: 'technology', name: 'Technology', icon: Lightbulb }
  ];

  const filteredFigures = selectedCategory === 'all' 
    ? figures 
    : figures.filter(figure => figure.category === selectedCategory);

  if (selectedFigure) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedFigure(null)}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Figures
          </button>

          <div className="card p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="text-center lg:text-left">
                <div className="text-6xl mb-4">{selectedFigure.image}</div>
                {selectedFigure.isIslamic && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm mb-4">
                    <Star className="w-4 h-4" />
                    Islamic Golden Age
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">{selectedFigure.name}</h1>
                <p className="text-xl text-blue-400 mb-2">{selectedFigure.title}</p>
                <p className="text-gray-400 mb-6">{selectedFigure.era}</p>

                <blockquote className="text-lg italic border-l-4 border-blue-500 pl-4 py-2 mb-6 text-gray-300">
                  "{selectedFigure.quote}"
                </blockquote>

                <p className="text-gray-300 leading-relaxed mb-6">{selectedFigure.story}</p>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Key Achievements
                    </h3>
                    <ul className="space-y-2">
                      {selectedFigure.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Lasting Impact
                    </h3>
                    <ul className="space-y-2">
                      {selectedFigure.impact.map((impact, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {impact}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Inspirational Figures
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Learn from the greatest minds and leaders throughout history. Their stories of perseverance, innovation, and wisdom continue to inspire us today.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'border border-white/20 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Figures Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFigures.map((figure) => (
            <div
              key={figure.id}
              onClick={() => setSelectedFigure(figure)}
              className="card p-6 cursor-pointer hover:scale-105 transition-transform duration-300 group relative"
            >
              {figure.isIslamic && (
                <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/30 rounded-full p-2">
                  <Star className="w-4 h-4 text-green-400" />
                </div>
              )}
              
              <div className="text-center">
                <div className="text-4xl mb-4">{figure.image}</div>
                <h3 className="text-xl font-bold mb-2">{figure.name}</h3>
                <p className="text-blue-400 text-sm mb-2">{figure.title}</p>
                <p className="text-gray-500 text-sm mb-4">{figure.era}</p>
                
                <div className="text-sm text-gray-400 italic group-hover:text-gray-300 transition-colors">
                  "{figure.quote.slice(0, 100)}..."
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-400">
                    {figure.achievements.length} achievements
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFigures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No figures found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspirationalFigures;