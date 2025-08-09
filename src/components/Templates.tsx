import React, { useState } from 'react';
import { Download, Eye, Star, User, FileText, Briefcase, GraduationCap, Award, Phone, Mail, MapPin, Globe, Linkedin, Github } from 'lucide-react';

type View = 'home' | 'dashboard' | 'builder' | 'analyzer' | 'templates' | 'pricing';

interface TemplatesProps {
  onNavigate: (view: View) => void;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  isPro: boolean;
  hasPhoto: boolean;
  color: string;
  style: 'modern' | 'classic' | 'creative' | 'minimal';
}

const Templates: React.FC<TemplatesProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const templates: Template[] = [
    // Modern Templates
    {
      id: 'modern-blue',
      name: 'Modern Professional',
      category: 'modern',
      description: 'Clean and modern design with blue accents',
      preview: 'modern-blue',
      isPro: false,
      hasPhoto: true,
      color: 'blue',
      style: 'modern'
    },
    {
      id: 'modern-green',
      name: 'Tech Professional',
      category: 'modern',
      description: 'Perfect for tech professionals with green highlights',
      preview: 'modern-green',
      isPro: false,
      hasPhoto: true,
      color: 'green',
      style: 'modern'
    },
    {
      id: 'modern-purple',
      name: 'Creative Professional',
      category: 'modern',
      description: 'Creative design with purple accents',
      preview: 'modern-purple',
      isPro: false,
      hasPhoto: true,
      color: 'purple',
      style: 'modern'
    },
    {
      id: 'modern-orange',
      name: 'Dynamic Professional',
      category: 'modern',
      description: 'Dynamic layout with orange highlights',
      preview: 'modern-orange',
      isPro: false,
      hasPhoto: true,
      color: 'orange',
      style: 'modern'
    },
    // Classic Templates
    {
      id: 'classic-navy',
      name: 'Executive Classic',
      category: 'classic',
      description: 'Traditional professional design with navy accents',
      preview: 'classic-navy',
      isPro: true,
      hasPhoto: false,
      color: 'navy',
      style: 'classic'
    },
    {
      id: 'classic-burgundy',
      name: 'Corporate Classic',
      category: 'classic',
      description: 'Corporate-style template with burgundy highlights',
      preview: 'classic-burgundy',
      isPro: true,
      hasPhoto: false,
      color: 'burgundy',
      style: 'classic'
    },
    {
      id: 'classic-forest',
      name: 'Professional Classic',
      category: 'classic',
      description: 'Classic design with forest green accents',
      preview: 'classic-forest',
      isPro: true,
      hasPhoto: false,
      color: 'forest',
      style: 'classic'
    },
    {
      id: 'classic-slate',
      name: 'Elegant Classic',
      category: 'classic',
      description: 'Elegant traditional design with slate accents',
      preview: 'classic-slate',
      isPro: true,
      hasPhoto: false,
      color: 'slate',
      style: 'classic'
    },
    // Creative Templates
    {
      id: 'creative-teal',
      name: 'Creative Designer',
      category: 'creative',
      description: 'Bold creative design with teal highlights',
      preview: 'creative-teal',
      isPro: true,
      hasPhoto: true,
      color: 'teal',
      style: 'creative'
    },
    {
      id: 'creative-pink',
      name: 'Artistic Professional',
      category: 'creative',
      description: 'Artistic layout with pink accents',
      preview: 'creative-pink',
      isPro: true,
      hasPhoto: true,
      color: 'pink',
      style: 'creative'
    },
    {
      id: 'creative-indigo',
      name: 'Modern Creative',
      category: 'creative',
      description: 'Modern creative design with indigo highlights',
      preview: 'creative-indigo',
      isPro: true,
      hasPhoto: true,
      color: 'indigo',
      style: 'creative'
    },
    {
      id: 'creative-amber',
      name: 'Vibrant Creative',
      category: 'creative',
      description: 'Vibrant design with amber accents',
      preview: 'creative-amber',
      isPro: true,
      hasPhoto: true,
      color: 'amber',
      style: 'creative'
    },
    // New Minimal White Templates
    {
      id: 'minimal-clean',
      name: 'Clean Minimal',
      category: 'minimal',
      description: 'Ultra-clean minimal design with subtle typography',
      preview: 'minimal-clean',
      isPro: false,
      hasPhoto: false,
      color: 'white',
      style: 'minimal'
    },
    {
      id: 'minimal-professional',
      name: 'Professional Minimal',
      category: 'minimal',
      description: 'Professional minimal layout with clean sections',
      preview: 'minimal-professional',
      isPro: false,
      hasPhoto: false,
      color: 'white',
      style: 'minimal'
    },
    {
      id: 'minimal-elegant',
      name: 'Elegant Minimal',
      category: 'minimal',
      description: 'Elegant minimal design with refined typography',
      preview: 'minimal-elegant',
      isPro: false,
      hasPhoto: false,
      color: 'white',
      style: 'minimal'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'modern', name: 'Modern', count: templates.filter(t => t.category === 'modern').length },
    { id: 'classic', name: 'Classic', count: templates.filter(t => t.category === 'classic').length },
    { id: 'creative', name: 'Creative', count: templates.filter(t => t.category === 'creative').length },
    { id: 'minimal', name: 'Minimal', count: templates.filter(t => t.category === 'minimal').length }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template: Template) => {
    // Store the selected template ID for the builder
    localStorage.setItem('selectedTemplateId', template.id);
    onNavigate('builder');
  };

  const renderTemplatePreview = (template: Template) => {
    const sampleData = {
      personalInfo: {
        name: 'Harshavardhan Bodapati',
        title: 'Full Stack Developer',
        email: 'harshavardhan80956@gmail.com',
        phone: '+91-9704257475',
        location: 'Vijayawada, India',
        linkedin: 'linkedin.com/in/harsha',
        github: 'github.com/harsha33983',
        website: 'harsha.dev'
      },
      summary: 'Versatile and detail-oriented Full Stack Developer with a strong foundation in both frontend and backend technologies. Passionate about building scalable web applications with clean, efficient code and user-friendly interfaces.',
      experience: [
        {
          company: 'Tech Solutions Inc',
          position: 'Senior Full Stack Developer',
          duration: '2022 - Present',
          description: 'Led development of enterprise web applications using React, Node.js, and cloud technologies.'
        },
        {
          company: 'Digital Innovations',
          position: 'Frontend Developer',
          duration: '2020 - 2022',
          description: 'Developed responsive web applications and improved user experience across multiple platforms.'
        }
      ],
      education: [
        {
          institution: 'Dhanalakshmi Srinivasan University',
          degree: 'Bachelor of Technology in Computer Science',
          duration: '2022 - 2026',
          gpa: '8.40 / 10.0'
        }
      ],
      skills: [
        {
          category: 'Programming Languages',
          items: ['Python', 'Java', 'JavaScript', 'TypeScript']
        },
        {
          category: 'Frontend Technologies',
          items: ['React.js', 'HTML', 'CSS', 'Tailwind CSS']
        },
        {
          category: 'Backend Technologies',
          items: ['Node.js', 'Express.js', 'FastAPI', 'MongoDB']
        }
      ]
    };

    // Minimal White Templates
    if (template.id === 'minimal-clean') {
      return (
        <div className="w-full h-full bg-white p-6 text-xs leading-tight font-sans">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{sampleData.personalInfo.name}</h1>
            <p className="text-lg text-gray-600 mb-3">{sampleData.personalInfo.title}</p>
            <div className="flex justify-center items-center space-x-4 text-gray-600">
              <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{sampleData.personalInfo.phone}</span>
              <span className="flex items-center"><Mail className="w-3 h-3 mr-1" />{sampleData.personalInfo.email}</span>
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{sampleData.personalInfo.location}</span>
            </div>
          </div>

          {/* About */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">About</h2>
            <p className="text-gray-700 leading-relaxed">{sampleData.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Experience</h2>
            {sampleData.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{exp.duration}</span>
                </div>
                <p className="text-gray-700 text-xs leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Education</h2>
            {sampleData.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs">{edu.duration}</span>
                    <p className="text-gray-600 text-xs">CGPA: {edu.gpa}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Skills</h2>
            {sampleData.skills.map((skillGroup, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-semibold text-gray-900 text-xs">{skillGroup.category}:</h3>
                <p className="text-gray-700 text-xs">{skillGroup.items.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (template.id === 'minimal-professional') {
      return (
        <div className="w-full h-full bg-white p-6 text-xs leading-tight font-sans">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{sampleData.personalInfo.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{sampleData.personalInfo.title}</p>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <span className="flex items-center"><Phone className="w-3 h-3 mr-2" />{sampleData.personalInfo.phone}</span>
              <span className="flex items-center"><Mail className="w-3 h-3 mr-2" />{sampleData.personalInfo.email}</span>
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-2" />{sampleData.personalInfo.location}</span>
              <span className="flex items-center"><Linkedin className="w-3 h-3 mr-2" />{sampleData.personalInfo.linkedin}</span>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2 pb-1 border-b border-gray-300">PROFESSIONAL SUMMARY</h2>
            <p className="text-gray-700 leading-relaxed">{sampleData.summary}</p>
          </div>

          {/* Professional Experience */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300">PROFESSIONAL EXPERIENCE</h2>
            {sampleData.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.position}</h3>
                    <p className="font-semibold text-gray-700">{exp.company}</p>
                  </div>
                  <span className="text-gray-600 text-xs font-medium">{exp.duration}</span>
                </div>
                <p className="text-gray-700 text-xs leading-relaxed mt-1">{exp.description}</p>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300">EDUCATION</h2>
            {sampleData.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 text-xs">{edu.duration}</span>
                    <p className="text-gray-600 text-xs">CGPA: {edu.gpa}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300">SKILLS</h2>
            {sampleData.skills.map((skillGroup, index) => (
              <div key={index} className="mb-2">
                <span className="font-bold text-gray-900 text-xs">{skillGroup.category}: </span>
                <span className="text-gray-700 text-xs">{skillGroup.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (template.id === 'minimal-elegant') {
      return (
        <div className="w-full h-full bg-white p-6 text-xs leading-tight font-serif">
          {/* Header */}
          <div className="text-center mb-8 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">{sampleData.personalInfo.name}</h1>
            <p className="text-lg text-gray-600 mb-4 italic">{sampleData.personalInfo.title}</p>
            <div className="flex justify-center items-center space-x-6 text-gray-600">
              <span>{sampleData.personalInfo.phone}</span>
              <span>•</span>
              <span>{sampleData.personalInfo.email}</span>
              <span>•</span>
              <span>{sampleData.personalInfo.location}</span>
            </div>
            <div className="flex justify-center items-center space-x-6 text-gray-600 mt-2">
              <span>{sampleData.personalInfo.linkedin}</span>
              <span>•</span>
              <span>{sampleData.personalInfo.github}</span>
            </div>
          </div>

          {/* About */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 text-center tracking-widest">ABOUT</h2>
            <p className="text-gray-700 leading-relaxed text-justify">{sampleData.summary}</p>
          </div>

          {/* Projects */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 text-center tracking-widest">PROJECTS</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-gray-900">Streamflix | <span className="italic font-normal">A Movie Streaming Platform</span></h3>
                <ul className="text-gray-700 text-xs mt-1 space-y-1">
                  <li>• Streamflix is a fully responsive movie streaming platform inspired by Netflix</li>
                  <li>• Implemented secure sign-up, login, and logout functionality using Firebase Authentication</li>
                  <li>• Integrated with the TMDB API to fetch real-time movie and TV show data</li>
                  <li>• Embedded YouTube player to stream trailers and full-length content directly within the app</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">ResuMaster | <span className="italic font-normal">AI Powered Resume Maker and analyzer</span></h3>
                <ul className="text-gray-700 text-xs mt-1 space-y-1">
                  <li>• Built an intelligent web application that analyzes resumes using AI</li>
                  <li>• Integrated Supabase Authentication to enable secure sign-up/login</li>
                  <li>• Developed a built-in resume builder with rich-text editing and formatting support</li>
                  <li>• Enabled resume saving, version history, and PDF download functionality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 text-center tracking-widest">EDUCATION</h2>
            {sampleData.education.map((edu, index) => (
              <div key={index} className="text-center">
                <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                <p className="text-gray-700 italic">{edu.degree}</p>
                <div className="flex justify-center space-x-4 text-gray-600 text-xs mt-1">
                  <span>{edu.duration}</span>
                  <span>•</span>
                  <span>CGPA: {edu.gpa}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 text-center tracking-widest">SKILLS</h2>
            {sampleData.skills.map((skillGroup, index) => (
              <div key={index} className="mb-2 text-center">
                <span className="font-bold text-gray-900 text-xs">{skillGroup.category}: </span>
                <span className="text-gray-700 text-xs">{skillGroup.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default preview for other templates
    return (
      <div className={`w-full h-full p-4 text-xs ${
        template.color === 'white' ? 'bg-white' : 
        template.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
        template.color === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100' :
        template.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
        template.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-orange-100' :
        template.color === 'navy' ? 'bg-gradient-to-br from-slate-50 to-slate-100' :
        template.color === 'burgundy' ? 'bg-gradient-to-br from-red-50 to-red-100' :
        template.color === 'forest' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' :
        template.color === 'slate' ? 'bg-gradient-to-br from-gray-50 to-gray-100' :
        template.color === 'teal' ? 'bg-gradient-to-br from-teal-50 to-teal-100' :
        template.color === 'pink' ? 'bg-gradient-to-br from-pink-50 to-pink-100' :
        template.color === 'indigo' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100' :
        template.color === 'amber' ? 'bg-gradient-to-br from-amber-50 to-amber-100' :
        'bg-white'
      }`}>
        <div className={`${
          template.style === 'modern' ? 'grid grid-cols-3 gap-4' :
          template.style === 'creative' ? 'grid grid-cols-5 gap-2' :
          'space-y-3'
        }`}>
          {/* Header */}
          <div className={`${
            template.style === 'modern' ? 'col-span-2' :
            template.style === 'creative' ? 'col-span-3' :
            ''
          }`}>
            <div className={`${
              template.hasPhoto ? 'flex items-center space-x-3' : ''
            }`}>
              {template.hasPhoto && (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  template.color === 'blue' ? 'bg-blue-600' :
                  template.color === 'green' ? 'bg-green-600' :
                  template.color === 'purple' ? 'bg-purple-600' :
                  template.color === 'orange' ? 'bg-orange-600' :
                  template.color === 'teal' ? 'bg-teal-600' :
                  template.color === 'pink' ? 'bg-pink-600' :
                  template.color === 'indigo' ? 'bg-indigo-600' :
                  template.color === 'amber' ? 'bg-amber-600' :
                  'bg-gray-600'
                }`}>
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className={`font-bold ${
                  template.style === 'creative' ? 'text-lg' : 'text-base'
                } ${
                  template.color === 'blue' ? 'text-blue-900' :
                  template.color === 'green' ? 'text-green-900' :
                  template.color === 'purple' ? 'text-purple-900' :
                  template.color === 'orange' ? 'text-orange-900' :
                  template.color === 'navy' ? 'text-slate-900' :
                  template.color === 'burgundy' ? 'text-red-900' :
                  template.color === 'forest' ? 'text-emerald-900' :
                  template.color === 'slate' ? 'text-gray-900' :
                  template.color === 'teal' ? 'text-teal-900' :
                  template.color === 'pink' ? 'text-pink-900' :
                  template.color === 'indigo' ? 'text-indigo-900' :
                  template.color === 'amber' ? 'text-amber-900' :
                  'text-gray-900'
                }`}>
                  {sampleData.personalInfo.name}
                </h1>
                <p className="text-gray-600 text-xs">{sampleData.personalInfo.title}</p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center space-x-1 text-gray-600">
                <Mail className="w-3 h-3" />
                <span>{sampleData.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{sampleData.personalInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Sidebar for modern/creative templates */}
          {(template.style === 'modern' || template.style === 'creative') && (
            <div className={`${
              template.style === 'modern' ? 'col-span-1' : 'col-span-2'
            } space-y-3`}>
              <div>
                <h3 className={`font-semibold text-xs mb-1 ${
                  template.color === 'blue' ? 'text-blue-800' :
                  template.color === 'green' ? 'text-green-800' :
                  template.color === 'purple' ? 'text-purple-800' :
                  template.color === 'orange' ? 'text-orange-800' :
                  template.color === 'teal' ? 'text-teal-800' :
                  template.color === 'pink' ? 'text-pink-800' :
                  template.color === 'indigo' ? 'text-indigo-800' :
                  template.color === 'amber' ? 'text-amber-800' :
                  'text-gray-800'
                }`}>
                  Skills
                </h3>
                <div className="space-y-1">
                  {sampleData.skills.slice(0, 2).map((skill, index) => (
                    <div key={index}>
                      <p className="text-xs font-medium text-gray-700">{skill.category}</p>
                      <p className="text-xs text-gray-600">{skill.items.slice(0, 3).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className={`${
            template.style === 'modern' ? 'col-span-3' :
            template.style === 'creative' ? 'col-span-5' :
            ''
          } space-y-3`}>
            {/* Summary */}
            <div>
              <h3 className={`font-semibold text-xs mb-1 ${
                template.color === 'blue' ? 'text-blue-800' :
                template.color === 'green' ? 'text-green-800' :
                template.color === 'purple' ? 'text-purple-800' :
                template.color === 'orange' ? 'text-orange-800' :
                template.color === 'navy' ? 'text-slate-800' :
                template.color === 'burgundy' ? 'text-red-800' :
                template.color === 'forest' ? 'text-emerald-800' :
                template.color === 'slate' ? 'text-gray-800' :
                template.color === 'teal' ? 'text-teal-800' :
                template.color === 'pink' ? 'text-pink-800' :
                template.color === 'indigo' ? 'text-indigo-800' :
                template.color === 'amber' ? 'text-amber-800' :
                'text-gray-800'
              }`}>
                Professional Summary
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {sampleData.summary.substring(0, 120)}...
              </p>
            </div>

            {/* Experience */}
            <div>
              <h3 className={`font-semibold text-xs mb-1 ${
                template.color === 'blue' ? 'text-blue-800' :
                template.color === 'green' ? 'text-green-800' :
                template.color === 'purple' ? 'text-purple-800' :
                template.color === 'orange' ? 'text-orange-800' :
                template.color === 'navy' ? 'text-slate-800' :
                template.color === 'burgundy' ? 'text-red-800' :
                template.color === 'forest' ? 'text-emerald-800' :
                template.color === 'slate' ? 'text-gray-800' :
                template.color === 'teal' ? 'text-teal-800' :
                template.color === 'pink' ? 'text-pink-800' :
                template.color === 'indigo' ? 'text-indigo-800' :
                template.color === 'amber' ? 'text-amber-800' :
                'text-gray-800'
              }`}>
                Experience
              </h3>
              {sampleData.experience.slice(0, 1).map((exp, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-xs text-gray-900">{exp.position}</p>
                      <p className="text-xs text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-500">{exp.duration}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">
                    {exp.description.substring(0, 80)}...
                  </p>
                </div>
              ))}
            </div>

            {/* Education */}
            <div>
              <h3 className={`font-semibold text-xs mb-1 ${
                template.color === 'blue' ? 'text-blue-800' :
                template.color === 'green' ? 'text-green-800' :
                template.color === 'purple' ? 'text-purple-800' :
                template.color === 'orange' ? 'text-orange-800' :
                template.color === 'navy' ? 'text-slate-800' :
                template.color === 'burgundy' ? 'text-red-800' :
                template.color === 'forest' ? 'text-emerald-800' :
                template.color === 'slate' ? 'text-gray-800' :
                template.color === 'teal' ? 'text-teal-800' :
                template.color === 'pink' ? 'text-pink-800' :
                template.color === 'indigo' ? 'text-indigo-800' :
                template.color === 'amber' ? 'text-amber-800' :
                'text-gray-800'
              }`}>
                Education
              </h3>
              {sampleData.education.map((edu, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-xs text-gray-900">{edu.degree}</p>
                    <p className="text-xs text-gray-600">{edu.institution}</p>
                  </div>
                  <span className="text-xs text-gray-500">{edu.duration}</span>
                </div>
              ))}
            </div>

            {/* Skills for classic templates */}
            {template.style === 'classic' && (
              <div>
                <h3 className={`font-semibold text-xs mb-1 ${
                  template.color === 'navy' ? 'text-slate-800' :
                  template.color === 'burgundy' ? 'text-red-800' :
                  template.color === 'forest' ? 'text-emerald-800' :
                  template.color === 'slate' ? 'text-gray-800' :
                  'text-gray-800'
                }`}>
                  Skills
                </h3>
                <div className="space-y-1">
                  {sampleData.skills.slice(0, 2).map((skill, index) => (
                    <div key={index}>
                      <span className="text-xs font-medium text-gray-700">{skill.category}: </span>
                      <span className="text-xs text-gray-600">{skill.items.slice(0, 3).join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
          Professional Resume Templates
        </h1>
        <p className="text-xl text-gray-600 dark:text-dark-text-tertiary max-w-3xl mx-auto">
          Choose from our collection of professionally designed, ATS-friendly templates. 
          Each template is crafted to help you stand out and land your dream job.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-dark-bg-secondary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover-bg border border-gray-200 dark:border-dark-border-primary'
            }`}
          >
            {category.name}
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              selectedCategory === category.id
                ? 'bg-white bg-opacity-20 text-white'
                : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-muted'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="group bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {/* Template Preview */}
            <div className="relative h-64 bg-gray-50 dark:bg-dark-bg-tertiary overflow-hidden">
              <div className="absolute inset-0 scale-75 origin-top-left">
                {renderTemplatePreview(template)}
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full hover:shadow-lg transition-shadow"
                    title="Use Template"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Pro Badge */}
              {template.isPro && (
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Pro</span>
                  </div>
                </div>
              )}

              {/* Photo Badge */}
              {template.hasPhoto && (
                <div className="absolute top-3 left-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                    With Photo
                  </div>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">
                    {template.description}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full ${
                  template.color === 'blue' ? 'bg-blue-500' :
                  template.color === 'green' ? 'bg-green-500' :
                  template.color === 'purple' ? 'bg-purple-500' :
                  template.color === 'orange' ? 'bg-orange-500' :
                  template.color === 'navy' ? 'bg-slate-700' :
                  template.color === 'burgundy' ? 'bg-red-700' :
                  template.color === 'forest' ? 'bg-emerald-700' :
                  template.color === 'slate' ? 'bg-gray-500' :
                  template.color === 'teal' ? 'bg-teal-500' :
                  template.color === 'pink' ? 'bg-pink-500' :
                  template.color === 'indigo' ? 'bg-indigo-500' :
                  template.color === 'amber' ? 'bg-amber-500' :
                  template.color === 'white' ? 'bg-gray-200 border border-gray-300' :
                  'bg-gray-400'
                }`} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.style === 'modern' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
                    template.style === 'classic' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                    template.style === 'creative' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' :
                    template.style === 'minimal' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {template.style.charAt(0).toUpperCase() + template.style.slice(1)}
                  </span>
                  {template.hasPhoto && (
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                      Photo
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border-primary">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                  {selectedTemplate.name}
                </h3>
                <p className="text-gray-600 dark:text-dark-text-tertiary">
                  {selectedTemplate.description}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Use Template
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '8.5/11' }}>
                {renderTemplatePreview(selectedTemplate)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Create Your Perfect Resume?</h2>
        <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
          Choose a template and start building your professional resume in minutes. 
          Our AI-powered tools will help you create content that gets noticed.
        </p>
        <button 
          onClick={() => onNavigate('builder')}
          className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
        >
          Start Building Now
        </button>
      </div>
    </div>
  );
};

export default Templates;