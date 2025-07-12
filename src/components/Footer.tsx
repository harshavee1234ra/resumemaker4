import React from 'react';
import { FileText, Heart, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isHovered, setIsHovered] = React.useState(false);

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/harshavardhan',
      tooltip: 'Check out my projects'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com/in/harshavardhan',
      tooltip: 'Connect professionally'
    },
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:harsha@example.com',
      tooltip: 'Send me an email'
    },
    {
      name: 'Portfolio',
      icon: ExternalLink,
      href: '#',
      tooltip: 'View my portfolio'
    }
  ];

  const quickLinks = [
    { name: 'Templates', href: '#', description: 'Professional resume templates' },
    { name: 'Resume Builder', href: '#', description: 'Create your resume in minutes' },
    { name: 'AI Analyzer', href: '#', description: 'Get instant feedback on your resume' },
    { name: 'Cover Letters', href: '#', description: 'Custom cover letter generator' },
    { name: 'Pricing', href: '#', description: 'Choose your plan' }
  ];

  const resources = [
    { name: 'Help Center', href: '#', description: 'Get support' },
    { name: 'Career Tips', href: '#', description: 'Advice from experts' },
    { name: 'Resume Examples', href: '#', description: 'See successful resumes' },
    { name: 'Interview Guide', href: '#', description: 'Ace your interviews' },
    { name: 'Blog', href: '#', description: 'Latest career insights' }
  ];

  return (
    <footer className="bg-white dark:bg-dark-bg-primary border-t border-gray-200 dark:border-dark-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-transform duration-200 hover:scale-105 active:scale-95">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ResuMaster
              </span>
            </div>
            <p className="text-gray-600 dark:text-dark-text-tertiary mb-4 max-w-md">
              Build professional, ATS-optimized resumes with AI-powered content generation. 
              Stand out from the crowd and land your dream job.
            </p>
            <div 
              className="flex items-center space-x-2 text-sm text-gray-500 dark:text-dark-text-muted"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span>Made with</span>
              <span className={`w-4 h-4 text-red-500 fill-current transition-all duration-500 ${isHovered ? 'scale-125 rotate-12' : ''}`}>
                <Heart />
              </span>
              <span>by</span>
              <span className="font-semibold text-gray-700 dark:text-dark-text-secondary">
                Harsha Vardhan Bodapati
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group text-gray-600 dark:text-dark-text-tertiary hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm focus-visible-high-contrast flex items-start hover:translate-x-1"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    <div>
                      <span className="block">{item.name}</span>
                      <span className="text-xs text-gray-400 dark:text-dark-text-muted group-hover:text-gray-500 dark:group-hover:text-dark-text-tertiary">
                        {item.description}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group text-gray-600 dark:text-dark-text-tertiary hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm focus-visible-high-contrast flex items-start hover:translate-x-1"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    <div>
                      <span className="block">{item.name}</span>
                      <span className="text-xs text-gray-400 dark:text-dark-text-muted group-hover:text-gray-500 dark:group-hover:text-dark-text-tertiary">
                        {item.description}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Developer Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-border-primary">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                Developed by Harsha Vardhan Bodapati
              </h4>
              <p className="text-gray-600 dark:text-dark-text-tertiary text-sm max-w-md">
                Full-stack developer passionate about creating tools that help people advance their careers. 
                Specializing in React, Node.js, and AI integration.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 dark:text-dark-text-tertiary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-dark-hover-bg rounded-lg transition-all duration-200 focus-visible-high-contrast hover:-translate-y-1 active:scale-95"
                  aria-label={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-border-primary">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500 dark:text-dark-text-muted">
            <div className="mb-4 md:mb-0">
              <p>&copy; {currentYear} ResuMaster. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-gray-700 dark:hover:text-dark-text-secondary transition-colors duration-200 focus-visible-high-contrast hover:scale-105 active:scale-95"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;