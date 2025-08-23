import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Chat } from '@phosphor-icons/react'

interface Character {
  id: string
  name: string
  field: string
  achievements: string[]
  quote: string
  imageType: 'portrait' | 'work' // portrait for men, work/symbol for women
  imageDescription: string // What the image represents
  imageUrl?: string // Actual photo URL for men
}

const inspirationalCharacters: Character[] = [
  // Western Scientists & Innovators (Men with photos)
  {
    id: '1',
    name: 'Albert Einstein',
    field: 'Theoretical Physics',
    achievements: [
      'Developed the theory of relativity',
      'Explained the photoelectric effect',
      'Nobel Prize in Physics (1921)'
    ],
    quote: 'Imagination is more important than knowledge.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Einstein',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg'
  },
  {
    id: '2',
    name: 'Leonardo da Vinci',
    field: 'Renaissance Polymath',
    achievements: [
      'Created the Mona Lisa and The Last Supper',
      'Designed flying machines and inventions',
      'Advanced anatomy and engineering'
    ],
    quote: 'Learning never exhausts the mind.',
    imageType: 'portrait',
    imageDescription: 'Self-portrait of da Vinci',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo_self.jpg'
  },
  {
    id: '3',
    name: 'Nikola Tesla',
    field: 'Electrical Engineering',
    achievements: [
      'Invented alternating current (AC)',
      'Developed wireless technology',
      'Created the Tesla coil'
    ],
    quote: 'The present is theirs; the future, for which I really worked, is mine.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Tesla',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg'
  },
  {
    id: '4',
    name: 'Stephen Hawking',
    field: 'Theoretical Physics',
    achievements: [
      'Explained black hole radiation',
      'Authored "A Brief History of Time"',
      'Advanced our understanding of cosmology'
    ],
    quote: 'Intelligence is the ability to adapt to change.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Hawking',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Stephen_Hawking.StarChild.jpg'
  },
  {
    id: '5',
    name: 'Isaac Newton',
    field: 'Mathematics & Physics',
    achievements: [
      'Formulated laws of motion and gravitation',
      'Invented calculus',
      'Explained planetary motion'
    ],
    quote: 'If I have seen further, it is by standing on the shoulders of giants.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Newton',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg'
  },
  {
    id: '6',
    name: 'Charles Darwin',
    field: 'Natural Sciences',
    achievements: [
      'Developed theory of evolution',
      'Authored "On the Origin of Species"',
      'Revolutionized biological sciences'
    ],
    quote: 'It is not the strongest that survives, but the most adaptable to change.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Darwin',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Charles_Darwin_seated_crop.jpg'
  },
  {
    id: '7',
    name: 'Galileo Galilei',
    field: 'Astronomy & Physics',
    achievements: [
      'Improved the telescope',
      'Discovered Jupiter\'s moons',
      'Defended heliocentric model'
    ],
    quote: 'Doubt is the father of invention.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Galileo',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg'
  },

  // Islamic Golden Age Scholars (Men with photos/illustrations)
  {
    id: '8',
    name: 'ابن سينا (Ibn Sina / Avicenna)',
    field: 'Medicine & Philosophy',
    achievements: [
      'Wrote "The Canon of Medicine"',
      'Advanced medical knowledge for centuries',
      'Pioneered experimental medicine'
    ],
    quote: 'The knowledge of anything, since all things have causes, is not acquired unless it is known by its causes.',
    imageType: 'portrait',
    imageDescription: 'Historical illustration of Ibn Sina',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Avicenna_Canon_1597.jpg'
  },
  {
    id: '9',
    name: 'الخوارزمي (Al-Khwarizmi)',
    field: 'Mathematics & Astronomy',
    achievements: [
      'Founded algebra as a discipline',
      'Introduced Hindu-Arabic numerals to Europe',
      'Created astronomical tables'
    ],
    quote: 'Restore and complete what is lacking.',
    imageType: 'portrait',
    imageDescription: 'Medieval manuscript illustration',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Al-Khwarizmi_stamp.jpg'
  },
  {
    id: '10',
    name: 'ابن رشد (Ibn Rushd / Averroes)',
    field: 'Philosophy & Medicine',
    achievements: [
      'Commentated on Aristotle\'s works',
      'Bridged Islamic and Western philosophy',
      'Advanced rational thinking'
    ],
    quote: 'Ignorance leads to fear, fear leads to hatred, and hatred leads to violence.',
    imageType: 'portrait',
    imageDescription: 'Medieval portrait of Ibn Rushd',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Averroes_closeup.jpg'
  },
  {
    id: '11',
    name: 'الرازي (Al-Razi / Rhazes)',
    field: 'Medicine & Chemistry',
    achievements: [
      'Distinguished smallpox from measles',
      'Pioneered medical ethics',
      'Advanced clinical medicine'
    ],
    quote: 'Truth in medicine is an unattainable goal, and the art as described in books is far beneath the knowledge of an experienced practitioner.',
    imageType: 'portrait',
    imageDescription: 'Historical portrait of Al-Razi',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Al-Razi_Gerardus_Cremonensis.jpg'
  },
  {
    id: '12',
    name: 'ابن خلدون (Ibn Khaldun)',
    field: 'History & Sociology',
    achievements: [
      'Founded sociology as a science',
      'Wrote "The Muqaddimah"',
      'Analyzed social and economic patterns'
    ],
    quote: 'Geography is destiny.',
    imageType: 'portrait',
    imageDescription: 'Historical illustration of Ibn Khaldun',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ibn_Khaldun.jpg'
  },
  {
    id: '13',
    name: 'البتاني (Al-Battani)',
    field: 'Astronomy & Mathematics',
    achievements: [
      'Corrected Ptolemy\'s astronomical data',
      'Determined the length of the solar year',
      'Improved astronomical instruments'
    ],
    quote: 'Observation is the foundation of all knowledge.',
    imageType: 'portrait',
    imageDescription: 'Medieval astronomical manuscript',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Al-Battani_stamp.jpg'
  },
  {
    id: '14',
    name: 'ابن الهيثم (Ibn al-Haytham / Alhazen)',
    field: 'Optics & Scientific Method',
    achievements: [
      'Father of the scientific method',
      'Pioneered experimental optics',
      'Explained vision and light'
    ],
    quote: 'The seeker after truth is not one who studies the writings of the ancients... but rather the one who suspects his faith in them.',
    imageType: 'portrait',
    imageDescription: 'Medieval illustration in optics manuscript',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Alhazen%2C_the_Persian.gif'
  },

  // Modern Leaders & Innovators (Men with photos)
  {
    id: '15',
    name: 'Nelson Mandela',
    field: 'Human Rights & Leadership',
    achievements: [
      'Ended apartheid in South Africa',
      'First Black president of South Africa',
      'Nobel Peace Prize winner'
    ],
    quote: 'Education is the most powerful weapon which you can use to change the world.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Mandela',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Nelson_Mandela_1994.jpg'
  },
  {
    id: '16',
    name: 'Mahatma Gandhi',
    field: 'Philosophy & Non-violence',
    achievements: [
      'Led India to independence',
      'Pioneered non-violent resistance',
      'Inspired civil rights movements worldwide'
    ],
    quote: 'Be the change you wish to see in the world.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Gandhi',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg'
  },
  {
    id: '17',
    name: 'Martin Luther King Jr.',
    field: 'Civil Rights',
    achievements: [
      'Led American civil rights movement',
      'Delivered "I Have a Dream" speech',
      'Nobel Peace Prize winner'
    ],
    quote: 'The ultimate measure of a man is not where he stands in moments of comfort, but where he stands at times of challenge.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Dr. King',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Martin_Luther_King%2C_Jr..jpg'
  },

  // Women (with symbolic/work images)
  {
    id: '18',
    name: 'Marie Curie',
    field: 'Physics & Chemistry',
    achievements: [
      'First woman to win a Nobel Prize',
      'Discovered radium and polonium',
      'Pioneer in radioactivity research'
    ],
    quote: 'In science, we must be interested in things, not in persons.',
    imageType: 'work',
    imageDescription: 'Laboratory equipment and radium samples'
  },
  {
    id: '19',
    name: 'Rosa Parks',
    field: 'Civil Rights',
    achievements: [
      'Sparked Montgomery Bus Boycott',
      'Became symbol of civil rights movement',
      'Received Presidential Medal of Freedom'
    ],
    quote: 'You must never be fearful about what you are doing when it is right.',
    imageType: 'work',
    imageDescription: 'Historic Montgomery bus and civil rights symbols'
  },
  {
    id: '20',
    name: 'Katherine Johnson',
    field: 'Mathematics & Space Science',
    achievements: [
      'Calculated trajectories for NASA missions',
      'Enabled first US crewed spaceflights',
      'Depicted in "Hidden Figures" film'
    ],
    quote: 'Like what you do, and then you will do your best.',
    imageType: 'work',
    imageDescription: 'Mathematical calculations and spacecraft trajectories'
  },
  {
    id: '21',
    name: 'Frida Kahlo',
    field: 'Art & Culture',
    achievements: [
      'Created over 140 self-portraits',
      'Became icon of Mexican culture',
      'Advocated for indigenous rights'
    ],
    quote: 'I paint my own reality.',
    imageType: 'work',
    imageDescription: 'Colorful Mexican art and self-portrait elements'
  },
  {
    id: '22',
    name: 'فاطمة الفهرية (Fatima al-Fihri)',
    field: 'Education & Learning',
    achievements: [
      'Founded the University of Al Quaraouiyine',
      'Established the world\'s oldest degree-granting university',
      'Promoted education for all'
    ],
    quote: 'Seek knowledge from the cradle to the grave.',
    imageType: 'work',
    imageDescription: 'Ancient Islamic university architecture and manuscripts'
  },
  {
    id: '23',
    name: 'Malala Yousafzai',
    field: 'Education & Human Rights',
    achievements: [
      'Youngest Nobel Prize laureate',
      'Advocates for girls\' education worldwide',
      'Survived assassination attempt for her beliefs'
    ],
    quote: 'One child, one teacher, one book, one pen can change the world.',
    imageType: 'work',
    imageDescription: 'Books, school supplies, and education symbols'
  },

  // Additional Islamic Scholars (Men with historical illustrations)
  {
    id: '24',
    name: 'الجزري (Al-Jazari)',
    field: 'Engineering & Invention',
    achievements: [
      'Created sophisticated mechanical devices',
      'Invented the crankshaft',
      'Wrote "The Book of Knowledge of Ingenious Mechanical Devices"'
    ],
    quote: 'Innovation is born from necessity and perfected through persistence.',
    imageType: 'portrait',
    imageDescription: 'Medieval mechanical drawings and devices',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Al-jazari_robots.jpg'
  },
  {
    id: '25',
    name: 'ابن بطوطة (Ibn Battuta)',
    field: 'Geography & Travel',
    achievements: [
      'Traveled over 75,000 miles',
      'Documented diverse cultures and places',
      'Greatest medieval explorer'
    ],
    quote: 'Travel - it leaves you speechless, then turns you into a storyteller.',
    imageType: 'portrait',
    imageDescription: 'Medieval map and travel illustrations',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Ibn_Battuta_Mall.jpg'
  },
  {
    id: '26',
    name: 'عمر الخيام (Omar Khayyam)',
    field: 'Mathematics & Poetry',
    achievements: [
      'Advanced algebra and geometry',
      'Reformed the Persian calendar',
      'Wrote the famous Rubaiyat poetry'
    ],
    quote: 'The moving finger writes, and having written moves on.',
    imageType: 'portrait',
    imageDescription: 'Persian manuscript with mathematical and poetic texts',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Omar_Khayyam2.jpg'
  }
]

export function InspirationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % inspirationalCharacters.length)
    }, 8000) // Change every 8 seconds to give more time to read

    return () => clearInterval(interval)
  }, [])

  const currentCharacter = inspirationalCharacters[currentIndex]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Daily Inspiration</h2>
        <p className="text-white/70 text-sm">Learn from history's greatest minds across cultures and time</p>
      </div>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white overflow-hidden lg:h-[500px]">
        <CardContent className="p-0 lg:grid lg:grid-cols-2 lg:h-full">
          {/* Character Image */}
          <div className="h-48 lg:h-full bg-gradient-to-br from-primary/30 to-accent/30 relative flex items-center justify-center">
            <div className="text-center p-4">
              {currentCharacter.imageType === 'portrait' && currentCharacter.imageUrl ? (
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full mx-auto mb-3 overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/30 relative">
                  <img 
                    src={currentCharacter.imageUrl} 
                    alt={`Portrait of ${currentCharacter.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      const container = target.parentElement;
                      if (container) {
                        try {
                          container.innerHTML = `
                            <div class="w-full h-full bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <span class="text-2xl font-bold text-white">
                                ${currentCharacter.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          `;
                        } catch (error) {
                          console.debug('Image fallback error:', error);
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl lg:text-3xl font-bold text-white">
                    {currentCharacter.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <div className="text-xs lg:text-sm text-white/60 italic">
                {currentCharacter.imageDescription}
              </div>
            </div>
            
            {/* Progress indicators */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 max-w-xs overflow-hidden lg:hidden">
              <div className="flex space-x-1 bg-black/30 rounded-full px-2 py-1 backdrop-blur-sm">
                {inspirationalCharacters.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
                  const actualIndex = Math.max(0, currentIndex - 2) + index;
                  return (
                    <div
                      key={actualIndex}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        actualIndex === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  )
                })}
              </div>
              <div className="text-xs text-white/60 bg-black/30 rounded px-2 py-1 backdrop-blur-sm">
                {currentIndex + 1}/{inspirationalCharacters.length}
              </div>
            </div>
          </div>

          {/* Character Info */}
          <div className="p-6 lg:p-8 space-y-4 lg:space-y-6 lg:overflow-y-auto">
            <div className="text-center lg:text-left">
              <h3 className="text-xl lg:text-2xl font-bold text-white">{currentCharacter.name}</h3>
              <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-white/30">
                {currentCharacter.field}
              </Badge>
              
              {/* Progress indicators for large screens */}
              <div className="hidden lg:flex justify-center lg:justify-start space-x-1 mt-4">
                <div className="flex space-x-1 bg-black/30 rounded-full px-3 py-2 backdrop-blur-sm">
                  {inspirationalCharacters.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
                    const actualIndex = Math.max(0, currentIndex - 2) + index;
                    return (
                      <div
                        key={actualIndex}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          actualIndex === currentIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    )
                  })}
                </div>
                <div className="text-sm text-white/60 bg-black/30 rounded px-3 py-2 backdrop-blur-sm">
                  {currentIndex + 1}/{inspirationalCharacters.length}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white/90 lg:text-lg">Key Achievements:</h4>
              <ul className="space-y-1 lg:space-y-2">
                {currentCharacter.achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quote */}
            <div className="bg-white/5 rounded-lg p-4 lg:p-6 border border-white/10">
              <div className="flex items-start gap-3">
                <Chat size={20} className="lg:size-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white/90 italic text-sm lg:text-base leading-relaxed">
                    "{currentCharacter.quote}"
                  </p>
                  <p className="text-white/60 text-xs mt-2">
                    — {currentCharacter.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual navigation */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setCurrentIndex((prev) => 
            prev === 0 ? inspirationalCharacters.length - 1 : prev - 1
          )}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm backdrop-blur-sm border border-white/20"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % inspirationalCharacters.length)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm backdrop-blur-sm border border-white/20"
        >
          Next
        </button>
      </div>

      {/* Character counter */}
      <div className="text-center text-white/60 text-xs">
        {currentIndex + 1} of {inspirationalCharacters.length}
      </div>
    </div>
  )
}