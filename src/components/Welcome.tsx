import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Calendar, 
  Trophy, 
  Zap, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Welcome: React.FC = () => {
  const features = [
    {
      icon: CheckSquare,
      title: 'Smart Task Management',
      description: 'Organize your tasks with intelligent prioritization, deadlines, and progress tracking. Never miss an important assignment again.',
      image: '📝',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      link: '/tasks'
    },
    {
      icon: Calendar,
      title: 'Intelligent Calendar',
      description: 'Schedule your study sessions, exams, and deadlines with our smart calendar system that adapts to your learning patterns.',
      image: '📅',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      link: '/calendar'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Earn badges, track your progress, and celebrate milestones as you complete goals and maintain study streaks.',
      image: '🏆',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      link: '/achievements'
    },
    {
      icon: Zap,
      title: 'Daily Challenges',
      description: 'Stay motivated with daily study challenges, streak tracking, and gamified learning experiences.',
      image: '⚡',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      link: '/challenges'
    }
  ];

  return (
    <div className="relative min-h-screen text-gray-100">
      {/* Background: Dark pattern with math equations and medical icons */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          backgroundColor: '#0f172a',
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'800\' viewBox=\'0 0 800 800\'><rect width=\'800\' height=\'800\' fill=\'%230f172a\'/><g fill=\'%23ffffff\' fill-opacity=\'0.06\' font-family=\'monospace\' font-size=\'28\'><text x=\'40\' y=\'60\'>∑</text><text x=\'120\' y=\'140\'>π</text><text x=\'200\' y=\'220\'>∫</text><text x=\'280\' y=\'300\'>E=mc²</text><text x=\'360\' y=\'380\'>f(x)=ax²+bx+c</text><text x=\'80\' y=\'360\'>A+</text><text x=\'460\' y=\'160\'>Δ</text><text x=\'540\' y=\'240\'>√x</text><text x=\'620\' y=\'320\'>logₙx</text><text x=\'700\' y=\'400\'>∞</text><text x=\'80\' y=\'440\'>≈</text><text x=\'140\' y=\'520\'>⚕</text><text x=\'220\' y=\'600\'>✚</text><text x=\'300\' y=\'680\'>♥</text><text x=\'380\' y=\'520\'>⚗</text><text x=\'460\' y=\'600\'>⚛</text><text x=\'540\' y=\'680\'>⚕</text><text x=\'620\' y=\'520\'>✚</text></g></svg>")',
          backgroundRepeat: 'repeat',
          backgroundSize: '800px 800px',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Hero Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                  <Sparkles className="text-purple-300" size={20} />
                  <span className="text-white font-medium">Welcome to the Future of Learning</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  StudyPartner
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto lg:mx-0 leading-relaxed mb-8">
                  Your intelligent companion for academic success. Organize, learn, and achieve your goals with our comprehensive study management platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link
                    to="/dashboard"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                  >
                    Get Started
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                  
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold shadow-lg border border-white/20 hover:bg-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              {/* Main Hero Visual: digital data/graphs illustration (no humans) */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800">
                <svg
                  viewBox="0 0 1200 600"
                  preserveAspectRatio="xMidYMid slice"
                  className="w-full h-96"
                  role="img"
                  aria-label="Abstract dashboard with line chart, bars, pie rings and network graph"
                >
                  <defs>
                    <linearGradient id="gridFade" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.02" />
                    </linearGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M40 0H0V40" fill="none" stroke="url(#gridFade)" strokeWidth="1" />
                    </pattern>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Background grid */}
                  <rect width="1200" height="600" fill="url(#grid)" />

                  {/* Line chart with area */}
                  <g transform="translate(80,80)">
                    {/* Axes */}
                    <path d="M0 380H980 M0 0V380" stroke="#94a3b8" strokeOpacity="0.2" strokeWidth="2" />
                    {/* Area under line */}
                    <path d="M0 320 L120 300 L220 340 L320 260 L420 280 L520 220 L620 260 L720 180 L820 210 L920 140 L980 200 L980 380 L0 380 Z" fill="url(#areaGrad)" />
                    {/* Line */}
                    <polyline points="0,320 120,300 220,340 320,260 420,280 520,220 620,260 720,180 820,210 920,140 980,200" fill="none" stroke="url(#lineGrad)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                    {/* Data points */}
                    <g fill="#93c5fd" fillOpacity="0.9" stroke="#1f2937" strokeOpacity="0.4" strokeWidth="2">
                      <circle cx="120" cy="300" r="5" />
                      <circle cx="320" cy="260" r="5" />
                      <circle cx="520" cy="220" r="5" />
                      <circle cx="720" cy="180" r="5" />
                      <circle cx="920" cy="140" r="5" />
                    </g>
                  </g>

                  {/* Bar chart */}
                  <g transform="translate(80,460)">
                    <rect x="0" y="-80" width="40" height="80" fill="url(#barGrad)" rx="6" />
                    <rect x="70" y="-110" width="40" height="110" fill="url(#barGrad)" rx="6" />
                    <rect x="140" y="-50" width="40" height="50" fill="url(#barGrad)" rx="6" />
                    <rect x="210" y="-140" width="40" height="140" fill="url(#barGrad)" rx="6" />
                    <rect x="280" y="-95" width="40" height="95" fill="url(#barGrad)" rx="6" />
                    <rect x="350" y="-120" width="40" height="120" fill="url(#barGrad)" rx="6" />
                  </g>

                  {/* Donut/pie rings */}
                  <g transform="translate(980,150)">
                    <circle cx="0" cy="0" r="58" fill="none" stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.25" />
                    <circle cx="0" cy="0" r="58" fill="none" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="230 140" strokeLinecap="round" transform="rotate(-90)" />
                    <circle cx="0" cy="0" r="38" fill="none" stroke="#a78bfa" strokeWidth="12" strokeOpacity="0.25" />
                    <circle cx="0" cy="0" r="38" fill="none" stroke="#a78bfa" strokeWidth="12" strokeDasharray="160 90" strokeLinecap="round" transform="rotate(-40)" />
                    <circle cx="0" cy="0" r="20" fill="none" stroke="#34d399" strokeWidth="12" strokeDasharray="70 60" strokeLinecap="round" transform="rotate(30)" />
                  </g>

                  {/* Small network graph */}
                  <g transform="translate(900,400)" stroke="#60a5fa" strokeOpacity="0.6" strokeWidth="2" fill="#60a5fa">
                    <line x1="0" y1="0" x2="60" y2="-30" />
                    <line x1="0" y1="0" x2="-50" y2="20" />
                    <line x1="60" y1="-30" x2="20" y2="-70" />
                    <line x1="-50" y1="20" x2="20" y2="-70" />
                    <circle cx="0" cy="0" r="6" />
                    <circle cx="60" cy="-30" r="5" />
                    <circle cx="-50" cy="20" r="5" />
                    <circle cx="20" cy="-70" r="5" />
                  </g>
                </svg>
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Discover the powerful features that make StudyPartner the perfect companion for your academic journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-800/70 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/10"
              >
                {/* Feature Preview Image */}
                <div className="mb-6 rounded-xl overflow-hidden bg-slate-700/50 h-48">
                  {index === 0 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full block"
                      role="img"
                      aria-label="Digital Kanban board with To Do, Doing, and Done columns"
                    >
                      <defs>
                        <linearGradient id="kanbanBg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f1f5f9" />
                          <stop offset="100%" stopColor="#e2e8f0" />
                        </linearGradient>
                        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.15" />
                        </filter>
                      </defs>

                      <rect width="800" height="384" fill="url(#kanbanBg)" />

                      <g transform="translate(24,24)" fontFamily="Inter, system-ui" fontSize="18" fill="#0f172a">
                        <g>
                          <rect x="0" y="0" width="240" height="336" rx="14" fill="#ffffff" stroke="#e5e7eb" />
                          <text x="16" y="36" fontWeight="600">To Do</text>
                          <g filter="url(#cardShadow)">
                            <rect x="16" y="60" width="208" height="56" rx="10" fill="#dbeafe" />
                            <rect x="16" y="128" width="208" height="68" rx="10" fill="#fef3c7" />
                            <rect x="16" y="204" width="208" height="44" rx="10" fill="#e9d5ff" />
                          </g>
                        </g>

                        <g transform="translate(256,0)">
                          <rect x="0" y="0" width="240" height="336" rx="14" fill="#ffffff" stroke="#e5e7eb" />
                          <text x="16" y="36" fontWeight="600">Doing</text>
                          <g filter="url(#cardShadow)">
                            <rect x="16" y="60" width="208" height="80" rx="10" fill="#dcfce7" />
                            <rect x="16" y="148" width="208" height="56" rx="10" fill="#fee2e2" />
                          </g>
                          <rect x="16" y="224" width="160" height="10" rx="5" fill="#e5e7eb" />
                          <rect x="16" y="224" width="96" height="10" rx="5" fill="#34d399" />
                        </g>

                        <g transform="translate(512,0)">
                          <rect x="0" y="0" width="240" height="336" rx="14" fill="#ffffff" stroke="#e5e7eb" />
                          <text x="16" y="36" fontWeight="600">Done</text>
                          <g filter="url(#cardShadow)">
                            <rect x="16" y="60" width="208" height="56" rx="10" fill="#bfdbfe" />
                            <rect x="16" y="128" width="208" height="44" rx="10" fill="#ddd6fe" />
                            <rect x="16" y="180" width="208" height="44" rx="10" fill="#fde68a" />
                          </g>
                          <g fill="#22c55e">
                            <circle cx="32" cy="240" r="8" />
                            <circle cx="56" cy="240" r="8" />
                            <circle cx="80" cy="240" r="8" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  )}
                  
                  {index === 1 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full block"
                      role="img"
                      aria-label="Digital calendar planner with events and clock"
                    >
                      <rect width="800" height="384" fill="#eef2ff" />
                      <rect x="48" y="64" width="704" height="256" rx="16" fill="#ffffff" stroke="#e5e7eb" />
                      <rect x="48" y="64" width="704" height="48" rx="16" fill="#e0e7ff" />
                      <circle cx="88" cy="88" r="10" fill="#6366f1" />
                      <rect x="120" y="78" width="100" height="20" rx="6" fill="#c7d2fe" />

                      <g fill="#eef2ff">
                        <rect x="72" y="132" width="96" height="60" rx="10" />
                        <rect x="180" y="132" width="96" height="60" rx="10" />
                        <rect x="288" y="132" width="96" height="60" rx="10" />
                        <rect x="396" y="132" width="96" height="60" rx="10" />
                        <rect x="504" y="132" width="96" height="60" rx="10" />
                        <rect x="612" y="132" width="96" height="60" rx="10" />

                        <rect x="72" y="206" width="96" height="60" rx="10" />
                        <rect x="180" y="206" width="96" height="60" rx="10" />
                        <rect x="288" y="206" width="96" height="60" rx="10" />
                        <rect x="396" y="206" width="96" height="60" rx="10" />
                        <rect x="504" y="206" width="96" height="60" rx="10" />
                        <rect x="612" y="206" width="96" height="60" rx="10" />

                        <rect x="72" y="280" width="96" height="28" rx="10" />
                        <rect x="180" y="280" width="96" height="28" rx="10" />
                        <rect x="288" y="280" width="96" height="28" rx="10" />
                        <rect x="396" y="280" width="96" height="28" rx="10" />
                      </g>

                      <rect x="192" y="144" width="72" height="12" rx="6" fill="#60a5fa" />
                      <rect x="300" y="222" width="56" height="12" rx="6" fill="#34d399" />
                      <rect x="620" y="150" width="72" height="12" rx="6" fill="#f59e0b" />

                      <g transform="translate(700,88)">
                        <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#c7d2fe" />
                        <path d="M0 -10 V 0 L 8 6" stroke="#6366f1" strokeWidth="3" fill="none" strokeLinecap="round" />
                      </g>
                    </svg>
                  )}
                  
                  {index === 2 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full block"
                      role="img"
                      aria-label="Golden trophy with laurels and stars"
                    >
                      <rect width="800" height="384" fill="#fff7ed" />
                      <g transform="translate(400,190)">
                        <rect x="-80" y="80" width="160" height="20" rx="6" fill="#fbbf24" />
                        <rect x="-60" y="60" width="120" height="20" rx="6" fill="#f59e0b" />
                        <path d="M-70 -40 h140 a20 20 0 0 1 20 20 v10 a70 70 0 0 1 -70 70 h-40 a70 70 0 0 1 -70 -70 v-10 a20 20 0 0 1 20 -20z" fill="#f59e0b" />
                        <rect x="-24" y="40" width="48" height="24" rx="6" fill="#f59e0b" />
                        <rect x="-16" y="-60" width="32" height="100" rx="10" fill="#fbbf24" />
                      </g>
                      <g fill="#fcd34d">
                        <circle cx="220" cy="120" r="6" />
                        <circle cx="580" cy="120" r="6" />
                        <circle cx="520" cy="80" r="4" />
                        <circle cx="260" cy="80" r="4" />
                        <circle cx="400" cy="60" r="5" />
                      </g>
                      <g stroke="#86efac" strokeWidth="8" fill="none" opacity="0.8">
                        <path d="M140,210 q60,-80 140,-100" />
                        <path d="M660,210 q-60,-80 -140,-100" />
                      </g>
                    </svg>
                  )}
                  
                  {index === 3 && (
                    <svg
                      viewBox="0 0 800 384"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full block"
                      role="img"
                      aria-label="Stack of study books with checklist and lightning bolt"
                    >
                      <rect width="800" height="384" fill="#eff6ff" />
                      <g transform="translate(120,220)">
                        <rect x="0" y="0" width="560" height="20" rx="10" fill="#1d4ed8" />
                        <rect x="20" y="-28" width="520" height="28" rx="8" fill="#3b82f6" />
                        <rect x="40" y="-56" width="480" height="28" rx="8" fill="#60a5fa" />
                        <rect x="60" y="-84" width="440" height="28" rx="8" fill="#93c5fd" />
                      </g>
                      <g transform="translate(560,120)">
                        <rect x="-40" y="-40" width="120" height="80" rx="12" fill="#ffffff" stroke="#bfdbfe" />
                        <rect x="-24" y="-16" width="72" height="10" rx="5" fill="#60a5fa" />
                        <rect x="-24" y="4" width="48" height="10" rx="5" fill="#22c55e" />
                      </g>
                      <path d="M520 80 L480 160 L540 160 L500 240" fill="#f59e0b" />
                    </svg>
                  )}
                </div>

                {/* Feature Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-2xl">{feature.image}</span>
                </div>

                {/* Feature Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature Link */}
                <Link
                  to={feature.link}
                  className="inline-flex items-center gap-2 text-indigo-300 font-semibold hover:text-indigo-200 group-hover:gap-3 transition-all"
                >
                  {feature.title}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already elevated their academic performance with StudyPartner.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 bg-slate-900/90 text-white px-8 py-4 rounded-xl font-semibold shadow-xl ring-1 ring-white/20 hover:ring-white/30 hover:bg-slate-900 transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Your Journey
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 bg-slate-900 text-center">
        <p className="text-slate-400">
          Built with ❤️ for students who aspire to achieve more
        </p>
      </div>
    </div>
  );
};

export default Welcome;
