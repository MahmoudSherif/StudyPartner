import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Star,
  Gift,
  Flame
} from 'lucide-react';

const DailyChallenges: React.FC = () => {
  const { state, completeDailyChallenge } = useApp();

  const handleCompleteChallenge = (challengeId: string) => {
    const challenge = state.dailyChallenges.find(c => c.id === challengeId);
    if (challenge && challenge.progress >= challenge.target && !challenge.completed) {
      completeDailyChallenge(challengeId);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'task-completion': return <Target size={20} />;
      case 'mood-track': return <Flame size={20} />;
      case 'knowledge-add': return <Star size={20} />;
      case 'streak-maintain': return <Zap size={20} />;
      default: return <Target size={20} />;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'task-completion': return 'from-green-500 to-emerald-600';
      case 'mood-track': return 'from-pink-500 to-rose-600';
      case 'knowledge-add': return 'from-blue-500 to-indigo-600';
      case 'streak-maintain': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const activeChallenges = state.dailyChallenges.filter(c => 
    new Date(c.expiresAt) > new Date()
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Zap className="text-yellow-300" size={32} />
          Daily Challenges
        </h1>
        <p className="text-slate-300">Complete challenges to earn bonus XP and coins!</p>
      </div>

      {/* Challenge Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-yellow-300 mb-2">
            {activeChallenges.filter(c => c.completed).length}
          </div>
          <p className="text-sm text-slate-300">Completed Today</p>
        </div>

        <div className="card text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-blue-300 mb-2">
            {activeChallenges.length}
          </div>
          <p className="text-sm text-slate-300">Active Challenges</p>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Today's Challenges</h2>
        
        {activeChallenges.length === 0 ? (
          <div className="card text-center py-12">
            <Target size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">
              No active challenges
            </h3>
            <p className="text-slate-400">
              New challenges will be available tomorrow!
            </p>
          </div>
        ) : (
          activeChallenges.map((challenge) => {
            const progress = Math.min(challenge.progress, challenge.target);
            const progressPercentage = (progress / challenge.target) * 100;
            const isCompleted = challenge.completed;
            const canComplete = progress >= challenge.target && !isCompleted;

            return (
              <div
                key={challenge.id}
                className={`card relative overflow-hidden transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-900/20 border-emerald-500/30' 
                    : canComplete 
                    ? 'ring-1 ring-yellow-400/40' 
                    : 'hover:shadow-md'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getChallengeColor(challenge.type)} opacity-10`}></div>
                
                <div className="relative">
                  <div className="flex items-start gap-4">
                    {/* Challenge Icon */}
                    <div className={`p-3 rounded-full bg-gradient-to-r ${getChallengeColor(challenge.type)} text-white shadow-lg ring-1 ring-white/20`}>
                      {getChallengeIcon(challenge.type)}
                    </div>

                    {/* Challenge Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                          {challenge.title}
                          {isCompleted && <CheckCircle2 size={20} className="text-emerald-400" />}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Clock size={16} />
                          {getTimeRemaining(challenge.expiresAt)}
                        </div>
                      </div>

                      <p className="text-slate-300 mb-3">{challenge.description}</p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-white">
                            Progress: {progress}/{challenge.target}
                          </span>
                          <span className="text-slate-300">{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden ring-1 ring-white/5">
                          <div
                            className={`h-full bg-gradient-to-r ${getChallengeColor(challenge.type)} transition-all duration-500 ease-out`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm font-medium text-blue-300">
                            <Star size={16} />
                            +{challenge.reward.xp} XP
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium text-yellow-300">
                            <span className="text-base">🪙</span>
                            +{challenge.reward.coins}
                          </div>
                        </div>

                        {/* Complete Button */}
                        {canComplete && (
                          <button
                            onClick={() => handleCompleteChallenge(challenge.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <Gift size={16} />
                            Claim Reward!
                          </button>
                        )}

                        {isCompleted && (
                          <div className="bg-emerald-900/30 text-emerald-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 border border-emerald-500/30">
                            <CheckCircle2 size={16} />
                            Completed!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Challenge Tips */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <Star className="text-yellow-300" size={20} />
          Challenge Tips
        </h2>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Complete challenges before they expire to earn bonus rewards</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>New challenges refresh daily at midnight</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Higher difficulty challenges offer better rewards</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Some challenges contribute to multiple achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;