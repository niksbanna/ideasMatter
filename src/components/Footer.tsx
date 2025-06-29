import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">IdeasMatter</h3>
            <p className="text-slate-400 leading-relaxed">
              Empowering civic engagement through AI-powered policy drafting and blockchain voting.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Technology Stack</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span>🤖</span>
                <span>Google Gemini AI</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>⛓️</span>
                <span>Algorand Blockchain</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🗄️</span>
                <span>Supabase Database</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🚀</span>
                <span>Netlify Hosting</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Open Source</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              This platform is built with transparency and community in mind.
            </p>
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Built with Bolt.new</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
          <p>&copy; 2025 IdeasMatter. Making democracy more accessible and transparent.</p>
        </div>
      </div>
    </footer>
  );
};