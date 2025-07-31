import React from 'react';

const QuotesBar: React.FC = () => {
  const quotes = [
    // 30 Arabic Quotes
    { arabic: "العلم نور والجهل ظلام", english: "" },
    { arabic: "من جد وجد", english: "" },
    { arabic: "العلم يرفع بيتاً لا عماد له", english: "" },
    { arabic: "اطلب العلم من المهد إلى اللحد", english: "" },
    { arabic: "العلم في الصغر كالنقش على الحجر", english: "" },
    { arabic: "من سار على الدرب وصل", english: "" },
    { arabic: "النجاح رحلة وليس وجهة", english: "" },
    { arabic: "كل يوم خطوة نحو التميز", english: "" },
    { arabic: "الإصرار مفتاح النجاح", english: "" },
    { arabic: "العقل السليم في الجسم السليم", english: "" },
    { arabic: "الوقت كالسيف إن لم تقطعه قطعك", english: "" },
    { arabic: "النجاح ليس نهاية، والفشل ليس قاتلاً", english: "" },
    { arabic: "الطموح يولد العظمة", english: "" },
    { arabic: "التفاؤل هو الإيمان الذي يؤدي إلى الإنجاز", english: "" },
    { arabic: "لا تستسلم أبداً، لأنك لا تعرف أبداً ما قد يحدث غداً", english: "" },
    { arabic: "النجاح هو القدرة على الانتقال من فشل إلى فشل دون فقدان الحماس", english: "" },
    { arabic: "العلم يرفع من لا حسب له", english: "" },
    { arabic: "من طلب العلا سهر الليالي", english: "" },
    { arabic: "النجاح ليس في الوصول إلى القمة، بل في البقاء هناك", english: "" },
    { arabic: "كل شيء صعب قبل أن يصبح سهلاً", english: "" },
    { arabic: "القراءة غذاء العقل", english: "" },
    { arabic: "المعرفة قوة", english: "" },
    { arabic: "النجاح يبدأ بالخطوة الأولى", english: "" },
    { arabic: "لا تؤجل سعادة اليوم إلى الغد", english: "" },
    { arabic: "الطريق إلى النجاح هو دائماً قيد الإنشاء", english: "" },
    { arabic: "النجاح ليس مصادفة، بل هو اختيار", english: "" },
    { arabic: "كل فشل هو درس في النجاح", english: "" },
    { arabic: "النجاح هو أن تنتقل من فشل إلى فشل دون فقدان الحماس", english: "" },
    { arabic: "الطموح هو الطريق إلى النجاح", english: "" },
    { arabic: "النجاح يبدأ عندما تبدأ", english: "" },
    { arabic: "لا تنتظر السعادة، اصنعها", english: "" },
    { arabic: "النجاح هو أن تتعلم من أخطائك", english: "" },
    { arabic: "كل يوم فرصة جديدة للنجاح", english: "" },
    { arabic: "النجاح ليس في الوصول، بل في الاستمرار", english: "" },
    
    // 30 English Quotes
    { arabic: "", english: "Success is not final, failure is not fatal" },
    { arabic: "", english: "The only way to do great work is to love what you do" },
    { arabic: "", english: "Believe you can and you're halfway there" },
    { arabic: "", english: "The future belongs to those who believe in the beauty of their dreams" },
    { arabic: "", english: "Don't watch the clock; do what it does. Keep going" },
    { arabic: "", english: "The only limit to our realization of tomorrow is our doubts of today" },
    { arabic: "", english: "Success is walking from failure to failure with no loss of enthusiasm" },
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
    { arabic: "", english: "The only way to achieve the impossible is to believe it is possible" }
  ];

  return (
    <div className="quotes-bar">
      <div className="quotes-container">
        {quotes.map((quote, index) => (
          <div key={index} className="quote">
            {quote.arabic && <span className="quote-arabic">{quote.arabic}</span>}
            {quote.arabic && quote.english && <span className="quote-separator">|</span>}
            {quote.english && <span className="quote-english">{quote.english}</span>}
          </div>
        ))}
        {/* Duplicate quotes for seamless loop */}
        {quotes.map((quote, index) => (
          <div key={`duplicate-${index}`} className="quote">
            {quote.arabic && <span className="quote-arabic">{quote.arabic}</span>}
            {quote.arabic && quote.english && <span className="quote-separator">|</span>}
            {quote.english && <span className="quote-english">{quote.english}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotesBar; 