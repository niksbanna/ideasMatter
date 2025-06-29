import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, FileText, Vote, Users, Zap, Shield, Globe, MessageSquare, Heart, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            {t('home.hero.title')}
            <span className="text-blue-600 block">{t('home.hero.subtitle')}</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            {t('home.hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Lightbulb className="h-5 w-5" />
              <span>{t('home.hero.shareIdea')}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/explorer"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>{t('home.hero.exploreIdeas')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('home.howItWorks.title')}</h2>
          <p className="text-xl text-slate-600">{t('home.howItWorks.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.howItWorks.step1.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('home.howItWorks.step1.description')}
            </p>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.howItWorks.step2.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('home.howItWorks.step2.description')}
            </p>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
              <Vote className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('home.howItWorks.step3.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('home.howItWorks.step3.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Guest Access Feature */}
      <section className="py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('home.guestAccess.title')}</h2>
          <p className="text-xl text-slate-600">{t('home.guestAccess.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Globe className="h-12 w-12 text-emerald-600" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{t('home.guestAccess.browseFreelyTitle')}</h3>
                <p className="text-emerald-700">{t('home.guestAccess.browseFreelySubtitle')}</p>
              </div>
            </div>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t('home.guestAccess.features.readIdeas')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t('home.guestAccess.features.viewAiDrafts')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t('home.guestAccess.features.seeVotes')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t('home.guestAccess.features.listenAudio')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Users className="h-12 w-12 text-blue-600" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{t('home.guestAccess.joinToEngageTitle')}</h3>
                <p className="text-blue-700">{t('home.guestAccess.joinToEngageSubtitle')}</p>
              </div>
            </div>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>{t('home.guestAccess.features.voteProposals')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>{t('home.guestAccess.features.commentDiscuss')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>{t('home.guestAccess.features.submitIdeas')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>{t('home.guestAccess.features.saveIdeas')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Idea Types */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('home.ideaTypes.title')}</h2>
          <p className="text-xl text-slate-600">{t('home.ideaTypes.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <MessageSquare className="h-12 w-12 text-blue-600" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{t('home.ideaTypes.communityPolls.title')}</h3>
                <p className="text-blue-700">{t('home.ideaTypes.communityPolls.subtitle')}</p>
              </div>
            </div>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>{t('home.ideaTypes.communityPolls.examples.cereal')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>{t('home.ideaTypes.communityPolls.examples.pizza')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>{t('home.ideaTypes.communityPolls.examples.workWeek')}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center space-x-4 text-sm text-blue-700">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{t('home.ideaTypes.communityPolls.features.like')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>{t('home.ideaTypes.communityPolls.features.yesNo')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{t('home.ideaTypes.communityPolls.features.comment')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <FileText className="h-12 w-12 text-emerald-600" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{t('home.ideaTypes.aiProposals.title')}</h3>
                <p className="text-emerald-700">{t('home.ideaTypes.aiProposals.subtitle')}</p>
              </div>
            </div>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t('home.ideaTypes.aiProposals.features.problemAnalysis')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t('home.ideaTypes.aiProposals.features.proposedSolutions')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t('home.ideaTypes.aiProposals.features.implementationPlans')}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center space-x-4 text-sm text-emerald-700">
              <div className="flex items-center space-x-1">
                <Vote className="h-4 w-4" />
                <span>{t('home.ideaTypes.aiProposals.features.upDown')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>{t('home.ideaTypes.aiProposals.features.audioVideo')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{t('home.ideaTypes.aiProposals.features.discuss')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('home.categories.title')}</h2>
          <p className="text-xl text-slate-600">{t('home.categories.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Civic', icon: '🏛️', color: 'bg-blue-100 text-blue-800' },
            { name: 'Tech', icon: '💻', color: 'bg-indigo-100 text-indigo-800' },
            { name: 'Fun', icon: '🎉', color: 'bg-pink-100 text-pink-800' },
            { name: 'Life', icon: '🌱', color: 'bg-green-100 text-green-800' },
            { name: 'Food', icon: '🍕', color: 'bg-orange-100 text-orange-800' },
            { name: 'Sports', icon: '⚽', color: 'bg-purple-100 text-purple-800' },
            { name: 'Travel', icon: '✈️', color: 'bg-blue-100 text-blue-800' },
            { name: 'Science', icon: '🔬', color: 'bg-emerald-100 text-emerald-800' },
            { name: 'Entertainment', icon: '🎬', color: 'bg-red-100 text-red-800' },
            { name: 'Products', icon: '📱', color: 'bg-yellow-100 text-yellow-800' },
            { name: 'Education', icon: '📚', color: 'bg-purple-100 text-purple-800' },
            { name: 'Environment', icon: '🌍', color: 'bg-green-100 text-green-800' }
          ].map((category) => (
            <Link
              key={category.name}
              to={`/explorer?category=${category.name}`}
              className={`${category.color} rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-semibold text-sm">{category.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('home.features.title')}</h2>
          <p className="text-xl text-slate-600">{t('home.features.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-xl hover:bg-white/70 transition-colors">
            <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('home.features.aiPowered.title')}</h3>
            <p className="text-slate-600 text-sm">{t('home.features.aiPowered.description')}</p>
          </div>
          
          <div className="text-center p-6 rounded-xl hover:bg-white/70 transition-colors">
            <Shield className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('home.features.contentValidation.title')}</h3>
            <p className="text-slate-600 text-sm">{t('home.features.contentValidation.description')}</p>
          </div>
          
          <div className="text-center p-6 rounded-xl hover:bg-white/70 transition-colors">
            <Globe className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('home.features.openPlatform.title')}</h3>
            <p className="text-slate-600 text-sm">{t('home.features.openPlatform.description')}</p>
          </div>
          
          <div className="text-center p-6 rounded-xl hover:bg-white/70 transition-colors">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('home.features.communityDriven.title')}</h3>
            <p className="text-slate-600 text-sm">{t('home.features.communityDriven.description')}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <div className="text-4xl font-bold text-blue-600 mb-2">∞</div>
            <div className="text-slate-600 font-medium">{t('home.stats.ideasWelcome')}</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
            <div className="text-4xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-slate-600 font-medium">{t('home.stats.communityActive')}</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
            <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-slate-600 font-medium">{t('home.stats.openTransparent')}</div>
          </div>
        </div>
      </section>
    </div>
  );
};