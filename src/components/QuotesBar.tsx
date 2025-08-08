import React, { useState, useEffect } from 'react';

const QuotesBar: React.FC = () => {
  const quotes = [
    // Arabic Quotes with English translations (50+ quotes)
    { arabic: "العلم نور والجهل ظلام", english: "Knowledge is light and ignorance is darkness" },
    { arabic: "من جد وجد", english: "He who strives, achieves" },
    { arabic: "العلم يرفع بيتاً لا عماد له", english: "Knowledge raises a house with no pillars" },
    { arabic: "اطلب العلم من المهد إلى اللحد", english: "Seek knowledge from cradle to grave" },
    { arabic: "العلم في الصغر كالنقش على الحجر", english: "Learning in youth is like engraving on stone" },
    { arabic: "من سار على الدرب وصل", english: "Who walks the path, reaches the destination" },
    { arabic: "النجاح رحلة وليس وجهة", english: "Success is a journey, not a destination" },
    { arabic: "كل يوم خطوة نحو التميز", english: "Every day is a step towards excellence" },
    { arabic: "الإصرار مفتاح النجاح", english: "Persistence is the key to success" },
    { arabic: "العقل السليم في الجسم السليم", english: "A sound mind in a sound body" },
    { arabic: "الوقت كالسيف إن لم تقطعه قطعك", english: "Time is like a sword, if you don't cut it, it cuts you" },
    { arabic: "النجاح ليس نهاية، والفشل ليس قاتلاً", english: "Success is not final, failure is not fatal" },
    { arabic: "الطموح يولد العظمة", english: "Ambition breeds greatness" },
    { arabic: "التفاؤل هو الإيمان الذي يؤدي إلى الإنجاز", english: "Optimism is the faith that leads to achievement" },
    { arabic: "لا تستسلم أبداً، لأنك لا تعرف أبداً ما قد يحدث غداً", english: "Never give up, you never know what tomorrow may bring" },
    { arabic: "العلم يرفع من لا حسب له", english: "Knowledge elevates those without lineage" },
    { arabic: "من طلب العلا سهر الليالي", english: "Who seeks excellence stays awake at night" },
    { arabic: "النجاح ليس في الوصول إلى القمة، بل في البقاء هناك", english: "Success is not reaching the top, but staying there" },
    { arabic: "كل شيء صعب قبل أن يصبح سهلاً", english: "Everything is difficult before it becomes easy" },
    { arabic: "القراءة غذاء العقل", english: "Reading is food for the mind" },
    { arabic: "المعرفة قوة", english: "Knowledge is power" },
    { arabic: "النجاح يبدأ بالخطوة الأولى", english: "Success begins with the first step" },
    { arabic: "لا تؤجل سعادة اليوم إلى الغد", english: "Don't postpone today's happiness to tomorrow" },
    { arabic: "الطريق إلى النجاح هو دائماً قيد الإنشاء", english: "The road to success is always under construction" },
    { arabic: "النجاح ليس مصادفة، بل هو اختيار", english: "Success is not coincidence, it's a choice" },
    { arabic: "كل فشل هو درس في النجاح", english: "Every failure is a lesson in success" },
    { arabic: "الطموح هو الطريق إلى النجاح", english: "Ambition is the path to success" },
    { arabic: "النجاح يبدأ عندما تبدأ", english: "Success begins when you begin" },
    { arabic: "لا تنتظر السعادة، اصنعها", english: "Don't wait for happiness, create it" },
    { arabic: "النجاح هو أن تتعلم من أخطائك", english: "Success is learning from your mistakes" },
    { arabic: "كل يوم فرصة جديدة للنجاح", english: "Every day is a new opportunity for success" },
    { arabic: "النجاح ليس في الوصول، بل في الاستمرار", english: "Success is not in arriving, but in continuing" },
    { arabic: "الصبر مفتاح الفرج", english: "Patience is the key to relief" },
    { arabic: "من زرع حصد", english: "Who sows, reaps" },
    { arabic: "لا يأس مع الحياة ولا حياة مع اليأس", english: "No despair with life, no life with despair" },
    { arabic: "التعلم لا يتوقف عند عمر معين", english: "Learning doesn't stop at a certain age" },
    { arabic: "الأمل هو الشيء الوحيد الأقوى من الخوف", english: "Hope is the only thing stronger than fear" },
    { arabic: "العمل الجاد يتغلب على الموهبة", english: "Hard work beats talent" },
    { arabic: "الإبداع يتطلب الشجاعة", english: "Creativity requires courage" },
    { arabic: "التغيير يبدأ من الداخل", english: "Change starts from within" },
    { arabic: "الثقة بالنفس نصف النجاح", english: "Self-confidence is half of success" },
    { arabic: "لا تخف من البدايات الصعبة", english: "Don't fear difficult beginnings" },
    { arabic: "العقبات هي تلك الأشياء المخيفة التي تراها عندما ترفع عينيك عن هدفك", english: "Obstacles are those frightful things you see when you take your eyes off your goal" },
    { arabic: "كن أنت التغيير الذي تريد أن تراه في العالم", english: "Be the change you want to see in the world" },
    { arabic: "الحياة إما مغامرة جريئة أو لا شيء", english: "Life is either a daring adventure or nothing" },
    { arabic: "لا تحكم على يومك بالحصاد الذي جنيته، بل بالبذور التي زرعتها", english: "Don't judge each day by the harvest you reap but by the seeds that you plant" },
    { arabic: "التميز ليس مهارة، إنه موقف", english: "Excellence is not a skill, it's an attitude" },
    { arabic: "النجاح هو مجموع الجهود الصغيرة المتكررة يوماً بعد يوم", english: "Success is the sum of small efforts repeated day in and day out" },
    { arabic: "أفضل وقت لزراعة شجرة كان قبل 20 عاماً، ثاني أفضل وقت هو الآن", english: "The best time to plant a tree was 20 years ago. The second best time is now" },
    
    // English-only quotes (30+)
    { arabic: "", english: "The only way to do great work is to love what you do" },
    { arabic: "", english: "Believe you can and you're halfway there" },
    { arabic: "", english: "The future belongs to those who believe in the beauty of their dreams" },
    { arabic: "", english: "Don't watch the clock; do what it does. Keep going" },
    { arabic: "", english: "The only limit to our realization of tomorrow is our doubts of today" },
    { arabic: "", english: "The way to get started is to quit talking and begin doing" },
    { arabic: "", english: "It always seems impossible until it's done" },
    { arabic: "", english: "The only person you are destined to become is the person you decide to be" },
    { arabic: "", english: "Your time is limited, don't waste it living someone else's life" },
    { arabic: "", english: "The greatest glory in living lies not in never falling, but in rising every time we fall" },
    { arabic: "", english: "Life is what happens when you're busy making other plans" },
    { arabic: "", english: "The mind is everything. What you think you become" },
    { arabic: "", english: "The best way to predict the future is to create it" },
    { arabic: "", english: "Don't let yesterday take up too much of today" },
    { arabic: "", english: "You miss 100% of the shots you don't take" },
    { arabic: "", english: "The harder you work for something, the greater you'll feel when you achieve it" },
    { arabic: "", english: "Dream big and dare to fail" },
    { arabic: "", english: "What you get by achieving your goals is not as important as what you become" },
    { arabic: "", english: "The only impossible journey is the one you never begin" },
    { arabic: "", english: "In the middle of difficulty lies opportunity" },
    { arabic: "", english: "The difference between ordinary and extraordinary is that little extra" },
    { arabic: "", english: "You are never too old to set another goal or to dream a new dream" },
    { arabic: "", english: "The journey of a thousand miles begins with one step" },
    { arabic: "", english: "What you do today can improve all your tomorrows" },
    { arabic: "", english: "The secret of getting ahead is getting started" },
    { arabic: "", english: "Don't count the days, make the days count" },
    { arabic: "", english: "The best revenge is massive success" },
    { arabic: "", english: "Success is not the key to happiness. Happiness is the key to success" },
    { arabic: "", english: "The only way to achieve the impossible is to believe it is possible" },
    { arabic: "", english: "Your limitation—it's only your imagination" },
    { arabic: "", english: "Push yourself, because no one else is going to do it for you" },
    { arabic: "", english: "Great things never come from comfort zones" },
    { arabic: "", english: "Success doesn't just find you. You have to go out and get it" },
    { arabic: "", english: "The harder you work, the more luck you seem to have" },
    { arabic: "", english: "Don't stop when you're tired. Stop when you're done" },
    { arabic: "", english: "Wake up with determination. Go to bed with satisfaction" },
    { arabic: "", english: "Do something today that your future self will thank you for" },
    { arabic: "", english: "Little things make big days" },
    { arabic: "", english: "It's going to be hard, but hard does not mean impossible" },
    { arabic: "", english: "Don't wait for opportunity. Create it" }
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Change quote every 8 seconds with fade transition
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        // Get a random quote index different from current
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * quotes.length);
        } while (newIndex === currentQuoteIndex && quotes.length > 1);
        
        setCurrentQuoteIndex(newIndex);
        setIsVisible(true);
      }, 500); // Half second fade out before changing
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [currentQuoteIndex, quotes.length]);

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <div className="quotes-bar-fixed">
      {/* Solid background container that overlaps everything */}
      <div className="w-full p-2 sm:p-3 md:p-4 bg-slate-900 border-t-4 border-slate-700 shadow-2xl">
        {/* Single solid background container with responsive width */}
        <div className="w-full bg-slate-800 rounded-lg shadow-xl border-2 border-slate-600">
          {/* Content area with high contrast and responsive padding */}
          <div className="w-full bg-slate-800 rounded-lg py-1.5 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6">
            <div className="relative w-full max-w-none mx-auto">
              {/* Quote content with high contrast colors */}
              <div 
                className={`text-center transition-all duration-700 ease-in-out w-full ${
                  isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-3'
                }`}
              >
                {currentQuote.arabic && (
                  <p className="text-[0.9rem] sm:text-lg md:text-xl lg:text-2xl font-bold quotes-arabic-text mb-1 sm:mb-2 md:mb-3 text-white drop-shadow-2xl tracking-wide leading-relaxed" dir="rtl" style={{fontFamily: "'Playfair Display', 'Amiri', serif", textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', color: '#ffffff !important'}}>
                    "{currentQuote.arabic}"
                  </p>
                )}
                {currentQuote.english && (
                  <p className="text-[0.7rem] sm:text-sm md:text-base lg:text-lg font-semibold quotes-english-text text-white drop-shadow-2xl tracking-wider leading-relaxed" style={{fontFamily: "'Poppins', 'Inter', sans-serif", textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', color: '#ffffff !important'}}>
                    "{currentQuote.english}"
                  </p>
                )}
              </div>
              
              {/* Simple accent lines for visual appeal - responsive */}
              <div className="hidden md:block absolute top-0 left-2 sm:left-4 w-6 sm:w-8 h-1 bg-yellow-400 rounded-full opacity-80"></div>
              <div className="hidden md:block absolute top-0 right-2 sm:right-4 w-6 sm:w-8 h-1 bg-yellow-400 rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotesBar;