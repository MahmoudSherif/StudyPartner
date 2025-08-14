import React, { useRef, useEffect, useState } from 'react';
import { User, BookOpen, Quote, Award } from 'lucide-react';

interface InspirationFigure {
  id: string;
  name: string;
  nameArabic?: string;
  occupation: string;
  occupationArabic?: string;
  gender: 'male' | 'female';
  quote: string;
  quoteArabic?: string;
  achievement: string;
  achievementArabic?: string;
  imageUrl?: string;
}

const inspirationalFigures: InspirationFigure[] = [
  // Islamic Scholars and Figures (prioritized)
  {
    id: 'ibn-sina',
    name: 'Ibn Sina (Avicenna)',
    nameArabic: 'ابن سينا',
    occupation: 'Physician, Philosopher, Scientist',
    occupationArabic: 'طبيب، فيلسوف، عالم',
    gender: 'male',
    quote: 'The knowledge of anything, since all things have causes, is not acquired or complete unless it is known by its causes.',
    quoteArabic: 'معرفة أي شيء، لما كان لكل شيء أسباب، لا تكتمل إلا بمعرفة أسبابه',
    achievement: 'Father of modern medicine, wrote influential medical texts',
    achievementArabic: 'أبو الطب الحديث، ألف كتبًا طبية مؤثرة',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Avicenna_Canon_1597.jpg/256px-Avicenna_Canon_1597.jpg'
  },
  {
    id: 'al-khwarizmi',
    name: 'Al-Khwarizmi',
    nameArabic: 'الخوارزمي',
    occupation: 'Mathematician, Astronomer',
    occupationArabic: 'عالم رياضيات، فلكي',
    gender: 'male',
    quote: 'Restoration is the return of things to their natural state.',
    quoteArabic: 'الجبر هو إعادة الأشياء إلى حالتها الطبيعية',
    achievement: 'Father of Algebra, developed algorithms and decimal system',
    achievementArabic: 'أبو الجبر، طور الخوارزميات والنظام العشري',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Khwarizmi_Amirkabir_University_of_Technology.png/256px-Khwarizmi_Amirkabir_University_of_Technology.png'
  },
  {
    id: 'ibn-rushd',
    name: 'Ibn Rushd (Averroes)',
    nameArabic: 'ابن رشد',
    occupation: 'Philosopher, Physician, Polymath',
    occupationArabic: 'فيلسوف، طبيب، موسوعي',
    gender: 'male',
    quote: 'Ignorance leads to fear, fear leads to hatred, and hatred leads to violence.',
    quoteArabic: 'الجهل يؤدي إلى الخوف، والخوف يؤدي إلى البغض، والبغض يؤدي إلى العنف',
    achievement: 'Influential Islamic philosopher, bridge between Islamic and Christian thought',
    achievementArabic: 'فيلسوف إسلامي مؤثر، جسر بين الفكر الإسلامي والمسيحي',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Averroes_closeup.jpg/256px-Averroes_closeup.jpg'
  },
  {
    id: 'al-razi',
    name: 'Al-Razi',
    nameArabic: 'الرازي',
    occupation: 'Physician, Alchemist, Philosopher',
    occupationArabic: 'طبيب، كيميائي، فيلسوف',
    gender: 'male',
    quote: 'Truth in medicine is an unattainable goal, and the art as described in books is far beneath the knowledge of an experienced physician.',
    quoteArabic: 'الحق في الطب هدف لا يُدرك، والفن كما وُصف في الكتب أقل بكثير من معرفة الطبيب المجرب',
    achievement: 'Distinguished smallpox from measles, pioneer in medical ethics',
    achievementArabic: 'ميز بين الجدري والحصبة، رائد في أخلاقيات الطب',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Al-Razi.jpg/256px-Al-Razi.jpg'
  },
  {
    id: 'ibn-khaldun',
    name: 'Ibn Khaldun',
    nameArabic: 'ابن خلدون',
    occupation: 'Historian, Sociologist, Economist',
    occupationArabic: 'مؤرخ، عالم اجتماع، اقتصادي',
    gender: 'male',
    quote: 'Geography is destiny.',
    quoteArabic: 'الجغرافيا هي القدر',
    achievement: 'Father of sociology and historiography, developed theories of social cohesion',
    achievementArabic: 'أبو علم الاجتماع والتاريخ، طور نظريات التماسك الاجتماعي',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Ibn_Khaldun.jpg/256px-Ibn_Khaldun.jpg'
  },
  {
    id: 'fatima-al-fihri',
    name: 'Fatima al-Fihri',
    nameArabic: 'فاطمة الفهرية',
    occupation: 'Scholar, Founder',
    occupationArabic: 'عالمة، مؤسسة',
    gender: 'female',
    quote: 'Seek knowledge from the cradle to the grave.',
    quoteArabic: 'اطلبوا العلم من المهد إلى اللحد',
    achievement: 'Founded the University of al-Qarawiyyin, world\'s oldest operating university',
    achievementArabic: 'أسست جامعة القرويين، أقدم جامعة عاملة في العالم'
  },
  {
    id: 'al-zahrawi',
    name: 'Al-Zahrawi (Albucasis)',
    nameArabic: 'الزهراوي',
    occupation: 'Surgeon, Physician, Inventor',
    occupationArabic: 'جراح، طبيب، مخترع',
    gender: 'male',
    quote: 'Surgery is the art of healing with the hand.',
    quoteArabic: 'الجراحة هي فن الشفاء باليد',
    achievement: 'Father of modern surgery, invented over 200 surgical instruments',
    achievementArabic: 'أبو الجراحة الحديثة، اخترع أكثر من 200 أداة جراحية',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Al-Zahrawi.jpg/256px-Al-Zahrawi.jpg'
  },
  {
    id: 'ibn-al-nafis',
    name: 'Ibn al-Nafis',
    nameArabic: 'ابن النفيس',
    occupation: 'Physician, Anatomist, Physiologist',
    occupationArabic: 'طبيب، عالم تشريح، عالم وظائف أعضاء',
    gender: 'male',
    quote: 'The heart has two ventricles, and between them is a septum.',
    quoteArabic: 'للقلب بطينان، وبينهما حاجز',
    achievement: 'First to describe pulmonary circulation, pioneer in cardiovascular medicine',
    achievementArabic: 'أول من وصف الدورة الدموية الصغرى، رائد في طب القلب والأوعية',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Ibn_al-Nafis.jpg/256px-Ibn_al-Nafis.jpg'
  },
  {
    id: 'ibn-al-haytham',
    name: 'Ibn al-Haytham (Alhazen)',
    nameArabic: 'ابن الهيثم',
    occupation: 'Physicist, Mathematician, Astronomer',
    occupationArabic: 'فيزيائي، رياضي، فلكي',
    gender: 'male',
    quote: 'The seeker after truth is not one who studies the writings of the ancients, but one who suspects their faith in them.',
    quoteArabic: 'طالب الحق ليس هو الذي يدرس كتابات القدماء، بل من يشك في إيمانهم بها',
    achievement: 'Father of optics and scientific method, first to explain vision correctly',
    achievementArabic: 'أبو البصريات والمنهج العلمي، أول من فسر الرؤية بشكل صحيح',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Hazan.png/256px-Hazan.png'
  },
  {
    id: 'al-biruni',
    name: 'Al-Biruni',
    nameArabic: 'البيروني',
    occupation: 'Polymath, Physician, Physicist',
    occupationArabic: 'موسوعي، طبيب، فيزيائي',
    gender: 'male',
    quote: 'The investigation of truth is in one way hard, in another easy.',
    quoteArabic: 'التحقيق في الحقيقة من جهة صعب، ومن جهة أخرى سهل',
    achievement: 'Pioneer in experimental methods, calculated Earth\'s circumference',
    achievementArabic: 'رائد في المناهج التجريبية، حسب محيط الأرض',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Al-Biruni.jpg/256px-Al-Biruni.jpg'
  },
  {
    id: 'al-kindi',
    name: 'Al-Kindi',
    nameArabic: 'الكندي',
    occupation: 'Philosopher, Polymath, Physician',
    occupationArabic: 'فيلسوف، موسوعي، طبيب',
    gender: 'male',
    quote: 'We should not be ashamed to acknowledge truth from whatever source it comes to us.',
    quoteArabic: 'لا ينبغي أن نخجل من الاعتراف بالحق من أي مصدر أتانا',
    achievement: 'First peripatetic philosopher in Islam, contributed to medicine and mathematics',
    achievementArabic: 'أول فيلسوف مشائي في الإسلام، ساهم في الطب والرياضيات',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Al-Kindi.jpg/256px-Al-Kindi.jpg'
  },
  {
    id: 'al-jazari',
    name: 'Al-Jazari',
    nameArabic: 'الجزري',
    occupation: 'Inventor, Engineer, Mathematician',
    occupationArabic: 'مخترع، مهندس، رياضي',
    gender: 'male',
    quote: 'Let us construct a device that will benefit humanity.',
    quoteArabic: 'فلنصنع جهازًا ينفع الإنسانية',
    achievement: 'Father of robotics and mechanical engineering, invented programmable machines',
    achievementArabic: 'أبو الروبوتات والهندسة الميكانيكية، اخترع الآلات القابلة للبرمجة',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Al-Jazari_robots.jpg/256px-Al-Jazari_robots.jpg'
  },
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta',
    nameArabic: 'ابن بطوطة',
    occupation: 'Explorer, Geographer, Scholar',
    occupationArabic: 'رحالة، جغرافي، عالم',
    gender: 'male',
    quote: 'Travel leaves you speechless, then turns you into a storyteller.',
    quoteArabic: 'السفر يجعلك عاجزًا عن الكلام، ثم يحولك إلى راوي',
    achievement: 'Greatest medieval traveler, documented cultures across Islamic world',
    achievementArabic: 'أعظم الرحالة في العصور الوسطى، وثق الثقافات عبر العالم الإسلامي',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Ibn_Battuta.jpg/256px-Ibn_Battuta.jpg'
  },
  // Other Notable Figures
  {
    id: 'newton',
    name: 'Isaac Newton',
    occupation: 'Physicist, Mathematician',
    gender: 'male',
    quote: 'If I have seen further it is by standing on the shoulders of Giants.',
    achievement: 'Laws of Motion and Universal Gravitation',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/GodfreyKneller-IsaacNewton-1689.jpg/256px-GodfreyKneller-IsaacNewton-1689.jpg'
  },
  {
    id: 'darwin',
    name: 'Charles Darwin',
    occupation: 'Naturalist, Biologist',
    gender: 'male',
    quote: 'It is not the strongest of the species that survives, but the one most adaptable to change.',
    achievement: 'Theory of Evolution by Natural Selection',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/256px-Charles_Darwin_seated_crop.jpg'
  },
  {
    id: 'galileo',
    name: 'Galileo Galilei',
    occupation: 'Astronomer, Physicist',
    gender: 'male',
    quote: 'And yet it moves.',
    achievement: 'Father of Modern Science and Astronomy',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/256px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg'
  },
  {
    id: 'tesla',
    name: 'Nikola Tesla',
    occupation: 'Inventor, Electrical Engineer',
    gender: 'male',
    quote: 'The present is theirs; the future, for which I really worked, is mine.',
    achievement: 'Pioneered modern electrical systems and wireless technology',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Tesla_circa_1890.jpeg/256px-Tesla_circa_1890.jpeg'
  },
  {
    id: 'franklin',
    name: 'Rosalind Franklin',
    occupation: 'Chemist, X-ray Crystallographer',
    gender: 'female',
    quote: 'Science and everyday life cannot and should not be separated.',
    achievement: 'Key contributions to understanding DNA structure',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rosalind_Franklin_%281920-1958%29.jpg/256px-Rosalind_Franklin_%281920-1958%29.jpg'
  },
  {
    id: 'hawking',
    name: 'Stephen Hawking',
    occupation: 'Theoretical Physicist, Cosmologist',
    gender: 'male',
    quote: 'Intelligence is the ability to adapt to change.',
    achievement: 'Advanced understanding of black holes and cosmology',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Stephen_Hawking.StarChild.jpg/256px-Stephen_Hawking.StarChild.jpg'
  },
  {
    id: 'fleming',
    name: 'Alexander Fleming',
    occupation: 'Biologist, Pharmacologist',
    gender: 'male',
    quote: 'One sometimes finds what one is not looking for.',
    achievement: 'Discovered Penicillin, revolutionizing medicine',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Alexander_Fleming_3.jpg/256px-Alexander_Fleming_3.jpg'
  },
  {
    id: 'faraday',
    name: 'Michael Faraday',
    occupation: 'Physicist, Chemist',
    gender: 'male',
    quote: 'Nothing is too wonderful to be true if it be consistent with the laws of nature.',
    achievement: 'Father of Electrochemistry and Electromagnetism',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/M_Faraday_Th_Phillips_oil_1841-1842.jpg/256px-M_Faraday_Th_Phillips_oil_1841-1842.jpg'
  },
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
    achievement: 'First woman to win a Nobel Prize',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/256px-Marie_Curie_c._1920s.jpg'
  }
];

const BookIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg`}>
    <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
  </div>
);

const InspirationalFigures: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(
    window.innerWidth >= 640 ? '600px' : '384px'
  );

  // Helper function to check if figure is Islamic scholar
  const isIslamicScholar = (figureId: string) => {
    return ['ibn-sina', 'al-khwarizmi', 'ibn-rushd', 'al-razi', 'ibn-khaldun', 'fatima-al-fihri', 'al-zahrawi', 'ibn-al-nafis', 'ibn-al-haytham', 'al-biruni', 'al-kindi', 'al-jazari', 'ibn-battuta'].includes(figureId);
  };

  // Update container height on window resize
  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerWidth >= 640 ? '600px' : '384px');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll effect - scrolls every 5 seconds with dynamic card height calculation
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollInterval: NodeJS.Timeout;
    let currentCardIndex = 0;
    
    const scroll = () => {
      // Get all cards within the scroll container
      const cards = scrollContainer.querySelectorAll('.card');
      const containerHeight = scrollContainer.clientHeight;
      const scrollHeight = scrollContainer.scrollHeight;
      
      // Check if there's actually content to scroll
      if (scrollHeight <= containerHeight || cards.length === 0) {
        return;
      }
      
      const currentScroll = scrollContainer.scrollTop;
      const maxScroll = scrollHeight - containerHeight;
      
      if (currentScroll >= maxScroll - 10) { // Small tolerance for precision
        // Reset to top smoothly
        currentCardIndex = 0;
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Calculate next scroll position based on actual card positions
        if (currentCardIndex < cards.length - 1) {
          currentCardIndex++;
        } else {
          currentCardIndex = 0;
        }
        
        const targetCard = cards[currentCardIndex] as HTMLElement;
        const targetPosition = targetCard.offsetTop - scrollContainer.offsetTop;
        
        scrollContainer.scrollTo({ 
          top: Math.min(targetPosition, maxScroll), 
          behavior: 'smooth' 
        });
      }
    };

    // Initial delay to let the page settle, then scroll every 11 seconds
    const initialTimeout = setTimeout(() => {
      scroll(); // First scroll
      scrollInterval = setInterval(scroll, 11000);
    }, 2000);

    return () => {
      clearTimeout(initialTimeout);
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
          className="p-3 sm:p-4 overflow-y-auto"
          style={{
            height: containerHeight,
            maxHeight: containerHeight,
            overflowY: 'auto'
          }}
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
                  <div className="flex-1 space-y-4">
                    {/* Name and Occupation */}
                    <div>
                      {isIslamicScholar(figure.id) ? (
                        <>
                          <h3 className="font-bold text-xl lg:text-2xl text-white mb-2 font-arabic text-right">
                            {figure.nameArabic || figure.name}
                          </h3>
                          <h4 className="font-semibold text-lg lg:text-xl text-slate-300 mb-1 text-center lg:text-left">
                            {figure.name}
                          </h4>
                          <p className="text-slate-400 text-base lg:text-lg font-arabic text-right">
                            {figure.occupationArabic || figure.occupation}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-xl lg:text-2xl text-white mb-2 text-center lg:text-left">{figure.name}</h3>
                          <p className="text-slate-400 text-base lg:text-lg text-center lg:text-left">{figure.occupation}</p>
                        </>
                      )}
                    </div>

                    {/* Quote */}
                    <div className="relative bg-purple-900/30 p-4 lg:p-5 rounded-xl border border-purple-500/30">
                      <Quote className="w-6 h-6 text-purple-400 absolute -top-3 left-4 bg-slate-900 p-1 rounded" />
                      {isIslamicScholar(figure.id) ? (
                        <div>
                          <p className="text-white text-base lg:text-lg italic leading-relaxed font-arabic text-right mb-2">
                            "{figure.quoteArabic || figure.quote}"
                          </p>
                          <p className="text-slate-300 text-sm lg:text-base italic leading-relaxed text-center lg:text-left pl-2">
                            "{figure.quote}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-white text-base lg:text-lg italic leading-relaxed text-center lg:text-left pl-2">
                          "{figure.quote}"
                        </p>
                      )}
                    </div>

                    {/* Achievement */}
                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 lg:p-5 rounded-xl border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                        <Award className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white text-base lg:text-lg">
                          {isIslamicScholar(figure.id) ? 'الإنجاز الرئيسي' : 'Key Achievement'}
                        </h4>
                      </div>
                      {isIslamicScholar(figure.id) ? (
                        <div>
                          <p className="text-slate-300 text-sm lg:text-base leading-relaxed font-arabic text-right mb-2">
                            {figure.achievementArabic || figure.achievement}
                          </p>
                          <p className="text-slate-400 text-xs lg:text-sm leading-relaxed text-center lg:text-left">
                            {figure.achievement}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-300 text-sm lg:text-base leading-relaxed text-center lg:text-left">{figure.achievement}</p>
                      )}
                    </div>

                    {/* Special indicator for Islamic scholars */}
                    {isIslamicScholar(figure.id) && (
                      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 p-3 rounded-lg border border-amber-500/30">
                        <p className="text-amber-200 text-sm lg:text-base text-center lg:text-right font-arabic">
                          🌟 عالم إسلامي - رائد المعرفة
                        </p>
                        <p className="text-amber-300 text-xs lg:text-sm text-center lg:text-left mt-1">
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