import React from 'react';
import { ArrowRight, Zap, Target, Shield, Star } from 'lucide-react';

type View = 'home' | 'dashboard' | 'builder' | 'analyzer' | 'templates' | 'pricing';

interface HeroProps {
  onNavigate: (view: View) => void;
  onAuthRequest: (mode: 'signin' | 'signup') => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate, onAuthRequest }) => {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Content',
      description: 'Generate compelling resume content with advanced AI assistance'
    },
    {
      icon: Target,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes through applicant tracking systems'
    },
    {
      icon: Shield,
      title: 'Professional Templates',
      description: 'Choose from industry-specific, expertly designed templates'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            <span>Trusted by 50,000+ professionals</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Build Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Resume
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create ATS-optimized resumes with AI-powered content generation, real-time analysis, 
            and professional templates that get you noticed by employers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => onAuthRequest('signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Building Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => onNavigate('templates')}
              className="text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:shadow-lg transition-all border border-gray-200"
            >
              View Templates
            </button>
          </div>
          
          <div className="mt-12 text-sm text-gray-500">
            No credit card required • Free forever plan available
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to land your dream job
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI with proven resume strategies
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center group hover:scale-105 transition-transform"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 group-hover:shadow-xl transition-shadow">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to transform your career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful professionals who've landed their dream jobs with ResuMaster
            </p>
            <button 
              onClick={() => onAuthRequest('signup')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;