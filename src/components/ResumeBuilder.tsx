import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Eye, EyeOff, Plus, Trash2, Edit3, Sparkles, FileText, User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Award, Code, Palette, Layout, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { GeminiService } from '../lib/gemini';
import { PDFGenerator } from '../lib/pdfGenerator';

type View = 'home' | 'dashboard' | 'builder' | 'analyzer' | 'templates' | 'pricing' | 'settings';

interface ResumeBuilderProps {
  onNavigate: (view: View) => void;
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  location: string;
}

interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
  startDate: string;
  endDate: string;
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'list';
  items: string[];
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

interface ResumeData {
  id?: string;
  title: string;
  personal_info: PersonalInfo;
  summary: string;
  experience: { items: ExperienceItem[] };
  education: { items: EducationItem[] };
  skills: { items: SkillCategory[] };
  projects: { items: ProjectItem[] };
  custom_sections: CustomSection[];
  template_id: string;
  color_scheme: ColorScheme;
  is_published: boolean;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>({
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff'
  });

  const [resumeData, setResumeData] = useState<ResumeData>({
    title: 'My Resume',
    personal_info: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    },
    summary: '',
    experience: { items: [] },
    education: { items: [] },
    skills: { items: [] },
    projects: { items: [] },
    custom_sections: [],
    template_id: '',
    color_scheme: selectedColorScheme,
    is_published: false
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const geminiService = new GeminiService();

  // Template definitions
  const templates = {
    'minimal-clean': {
      id: 'minimal-clean',
      name: 'Clean Minimal',
      category: 'minimal',
      description: 'Ultra-clean minimal design with subtle typography',
      color: 'white',
      style: 'minimal',
      hasPhoto: false,
      sampleData: {
        personal_info: {
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
            id: 'exp-1',
            company: 'Tech Solutions Inc',
            position: 'Senior Full Stack Developer',
            startDate: '2022',
            endDate: 'Present',
            location: 'Remote',
            description: 'Led development of enterprise web applications using React, Node.js, and cloud technologies. Improved application performance by 40% and reduced deployment time by 60%.'
          }
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Dhanalakshmi Srinivasan University',
            degree: 'Bachelor of Technology',
            field: 'Computer Science',
            startDate: '2022',
            endDate: '2026',
            gpa: '8.40',
            location: 'Trichy, India'
          }
        ],
        skills: [
          {
            id: 'skill-1',
            category: 'Programming Languages',
            skills: ['Python', 'Java', 'JavaScript', 'TypeScript']
          },
          {
            id: 'skill-2',
            category: 'Frontend Technologies',
            skills: ['React.js', 'HTML', 'CSS', 'Tailwind CSS']
          }
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Streamflix',
            description: 'A fully responsive movie streaming platform inspired by Netflix',
            technologies: 'React.js, Firebase, TMDB API',
            link: 'https://streamflix.demo.com',
            startDate: '2023',
            endDate: '2023'
          }
        ]
      }
    },
    'minimal-professional': {
      id: 'minimal-professional',
      name: 'Professional Minimal',
      category: 'minimal',
      description: 'Professional minimal layout with clean sections',
      color: 'white',
      style: 'minimal',
      hasPhoto: false,
      sampleData: {
        personal_info: {
          name: 'Harshavardhan Bodapati',
          title: 'Full Stack Developer',
          email: 'harshavardhan80956@gmail.com',
          phone: '+91-9704257475',
          location: 'Vijayawada, India',
          linkedin: 'linkedin.com/in/harsha',
          github: 'github.com/harsha33983',
          website: 'harsha.dev'
        },
        summary: 'Versatile and detail-oriented Full Stack Developer with a strong foundation in both frontend and backend technologies.',
        experience: [
          {
            id: 'exp-1',
            company: 'Tech Solutions Inc',
            position: 'Senior Full Stack Developer',
            startDate: '2022',
            endDate: 'Present',
            location: 'Remote',
            description: 'Led development of enterprise web applications using React, Node.js, and cloud technologies.'
          }
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Dhanalakshmi Srinivasan University',
            degree: 'Bachelor of Technology',
            field: 'Computer Science',
            startDate: '2022',
            endDate: '2026',
            gpa: '8.40',
            location: 'Trichy, India'
          }
        ],
        skills: [
          {
            id: 'skill-1',
            category: 'Programming Languages',
            skills: ['Python', 'Java', 'JavaScript', 'TypeScript']
          }
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'ResuMaster',
            description: 'AI Powered Resume Maker and analyzer',
            technologies: 'React.js, Supabase, AI',
            link: 'https://resumaster.demo.com',
            startDate: '2023',
            endDate: '2024'
          }
        ]
      }
    },
    'minimal-elegant': {
      id: 'minimal-elegant',
      name: 'Elegant Minimal',
      category: 'minimal',
      description: 'Elegant minimal design with refined typography',
      color: 'white',
      style: 'minimal',
      hasPhoto: false,
      sampleData: {
        personal_info: {
          name: 'Harshavardhan Bodapati',
          title: 'Full Stack Developer',
          email: 'harshavardhan80956@gmail.com',
          phone: '+91-9704257475',
          location: 'Vijayawada, India',
          linkedin: 'linkedin.com/in/harsha',
          github: 'github.com/harsha33983',
          website: 'harsha.dev'
        },
        summary: 'Versatile and detail-oriented Full Stack Developer with a strong foundation in both frontend and backend technologies.',
        experience: [
          {
            id: 'exp-1',
            company: 'Tech Solutions Inc',
            position: 'Senior Full Stack Developer',
            startDate: '2022',
            endDate: 'Present',
            location: 'Remote',
            description: 'Led development of enterprise web applications using React, Node.js, and cloud technologies.'
          }
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Dhanalakshmi Srinivasan University',
            degree: 'Bachelor of Technology',
            field: 'Computer Science',
            startDate: '2022',
            endDate: '2026',
            gpa: '8.40',
            location: 'Trichy, India'
          }
        ],
        skills: [
          {
            id: 'skill-1',
            category: 'Programming Languages',
            skills: ['Python', 'Java', 'JavaScript', 'TypeScript']
          }
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Portfolio Website',
            description: 'Personal portfolio showcasing projects and skills',
            technologies: 'React.js, Tailwind CSS',
            link: 'https://portfolio.demo.com',
            startDate: '2023',
            endDate: '2023'
          }
        ]
      }
    }
  };

  // Load template data when component mounts or template is selected
  useEffect(() => {
    const loadTemplateData = () => {
      // Check for selected template from localStorage
      const templateId = localStorage.getItem('selectedTemplateId');
      if (templateId && templates[templateId as keyof typeof templates]) {
        const template = templates[templateId as keyof typeof templates];
        setSelectedTemplateId(templateId);
        
        // Load template sample data
        const templateData = template.sampleData;
        setResumeData(prev => ({
          ...prev,
          personal_info: templateData.personal_info,
          summary: templateData.summary,
          experience: { items: templateData.experience },
          education: { items: templateData.education },
          skills: { items: templateData.skills },
          projects: { items: templateData.projects },
          template_id: templateId
        }));
        
        // Clear the localStorage after loading
        localStorage.removeItem('selectedTemplateId');
      }
    };

    loadTemplateData();
  }, []);

  // Load existing resume for editing
  useEffect(() => {
    const loadExistingResume = async () => {
      const editingResumeId = localStorage.getItem('editingResumeId');
      if (editingResumeId && user) {
        try {
          const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', editingResumeId)
            .eq('user_id', user.id)
            .single();

          if (error) throw error;

          if (data) {
            setResumeData({
              id: data.id,
              title: data.title,
              personal_info: data.personal_info || resumeData.personal_info,
              summary: data.summary || '',
              experience: data.experience || { items: [] },
              education: data.education || { items: [] },
              skills: data.skills || { items: [] },
              projects: data.projects || { items: [] },
              custom_sections: data.custom_sections || [],
              template_id: data.template_id || '',
              color_scheme: data.color_scheme || selectedColorScheme,
              is_published: data.is_published || false
            });
            
            if (data.template_id) {
              setSelectedTemplateId(data.template_id);
            }
            if (data.color_scheme) {
              setSelectedColorScheme(data.color_scheme);
            }
          }
        } catch (error) {
          console.error('Error loading resume:', error);
          setError('Failed to load resume for editing');
        } finally {
          localStorage.removeItem('editingResumeId');
        }
      }
    };

    loadExistingResume();
  }, [user]);

  const colorSchemes = [
    { name: 'Classic Blue', primary: '#2563eb', secondary: '#64748b', accent: '#3b82f6', text: '#1f2937', background: '#ffffff' },
    { name: 'Professional Gray', primary: '#374151', secondary: '#6b7280', accent: '#4b5563', text: '#111827', background: '#ffffff' },
    { name: 'Modern Purple', primary: '#7c3aed', secondary: '#64748b', accent: '#8b5cf6', text: '#1f2937', background: '#ffffff' },
    { name: 'Clean Green', primary: '#059669', secondary: '#64748b', accent: '#10b981', text: '#1f2937', background: '#ffffff' },
    { name: 'Elegant Navy', primary: '#1e40af', secondary: '#64748b', accent: '#3b82f6', text: '#1f2937', background: '#ffffff' },
    { name: 'Pure White', primary: '#000000', secondary: '#374151', accent: '#6b7280', text: '#000000', background: '#ffffff' }
  ];

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Award },
    { id: 'custom', label: 'Custom Sections', icon: Plus },
    { id: 'design', label: 'Design', icon: Palette }
  ];

  const generateAIContent = async (section: string, context: string) => {
    setIsGeneratingAI(true);
    setError(null);
    
    try {
      const content = await geminiService.generateResumeContent(section, context);
      return content;
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      setError('Failed to generate content. Please try again.');
      throw new Error('Failed to generate content. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('Please sign in to save your resume');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const resumeDataToSave = {
        ...resumeData,
        user_id: user.id,
        template_id: selectedTemplateId,
        color_scheme: selectedColorScheme,
        updated_at: new Date().toISOString()
      };

      let result;
      if (resumeData.id) {
        // Update existing resume
        result = await supabase
          .from('resumes')
          .update(resumeDataToSave)
          .eq('id', resumeData.id)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new resume
        result = await supabase
          .from('resumes')
          .insert(resumeDataToSave)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setResumeData(prev => ({ ...prev, id: result.data.id }));
      alert('Resume saved successfully!');
    } catch (error: any) {
      console.error('Error saving resume:', error);
      setError(error.message || 'Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) {
      setError('Preview not available for download');
      return;
    }

    try {
      const filename = `${resumeData.title.replace(/\s+/g, '_')}.pdf`;
      await PDFGenerator.generateResumePDF(previewRef.current, filename);
    } catch (error) {
      console.error('Error downloading resume:', error);
      setError('Failed to download resume. Please try again.');
    }
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      location: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: { items: [...prev.experience.items, newExp] }
    }));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: {
        items: prev.experience.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: {
        items: prev.experience.items.filter(item => item.id !== id)
      }
    }));
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      location: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: { items: [...prev.education.items, newEdu] }
    }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: {
        items: prev.education.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: {
        items: prev.education.items.filter(item => item.id !== id)
      }
    }));
  };

  const addSkillCategory = () => {
    const newSkill: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: '',
      skills: []
    };
    setResumeData(prev => ({
      ...prev,
      skills: { items: [...prev.skills.items, newSkill] }
    }));
  };

  const updateSkillCategory = (id: string, field: 'category' | 'skills', value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        items: prev.skills.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeSkillCategory = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        items: prev.skills.items.filter(item => item.id !== id)
      }
    }));
  };

  const addProject = () => {
    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      technologies: '',
      link: '',
      startDate: '',
      endDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: { items: [...prev.projects.items, newProject] }
    }));
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: {
        items: prev.projects.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: {
        items: prev.projects.items.filter(item => item.id !== id)
      }
    }));
  };

  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: `custom-${Date.now()}`,
      title: '',
      content: '',
      type: 'text',
      items: []
    };
    setResumeData(prev => ({
      ...prev,
      custom_sections: [...prev.custom_sections, newSection]
    }));
  };

  const updateCustomSection = (id: string, field: keyof CustomSection, value: any) => {
    setResumeData(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeCustomSection = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.filter(section => section.id !== id)
    }));
  };

  const renderMinimalTemplate = () => {
    const { personal_info, summary, experience, education, skills, projects } = resumeData;
    
    if (selectedTemplateId === 'minimal-clean') {
      return (
        <div className="w-full h-full bg-white p-8 text-sm leading-tight font-sans" style={{ minHeight: '297mm' }}>
          {/* Header */}
          <div className="text-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide uppercase">
              {personal_info.name || 'Your Name'}
            </h1>
            <div className="flex justify-center items-center space-x-4 text-gray-600 mb-2">
              {personal_info.phone && (
                <span className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {personal_info.phone}
                </span>
              )}
              {personal_info.email && (
                <span className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {personal_info.email}
                </span>
              )}
            </div>
            {(personal_info.linkedin || personal_info.github) && (
              <div className="flex justify-center items-center space-x-4 text-gray-600">
                {personal_info.linkedin && (
                  <span className="flex items-center">
                    <Linkedin className="w-3 h-3 mr-1" />
                    {personal_info.linkedin}
                  </span>
                )}
                {personal_info.github && (
                  <span className="flex items-center">
                    <Github className="w-3 h-3 mr-1" />
                    {personal_info.github}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* About */}
          {summary && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">About</h2>
              <p className="text-gray-700 leading-relaxed text-justify">{summary}</p>
            </div>
          )}

          {/* Projects */}
          {projects.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">Projects</h2>
              <div className="space-y-4">
                {projects.items.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-bold text-gray-900">
                      {project.name} | <span className="italic font-normal">{project.description}</span>
                    </h3>
                    <ul className="text-gray-700 mt-1 space-y-1">
                      <li>• {project.description}</li>
                      {project.technologies && <li>• Technologies: {project.technologies}</li>}
                      {project.link && <li>• Link: {project.link}</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">Education</h2>
              {education.items.map((edu) => (
                <div key={edu.id} className="text-center mb-3">
                  <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                  <p className="text-gray-700 italic">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                  <div className="flex justify-center space-x-4 text-gray-600 text-sm mt-1">
                    <span>{edu.startDate} - {edu.endDate}</span>
                    {edu.gpa && (
                      <>
                        <span>•</span>
                        <span>CGPA: {edu.gpa}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.items.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">Skills</h2>
              {skills.items.map((skillGroup) => (
                <div key={skillGroup.id} className="mb-2 text-center">
                  <span className="font-bold text-gray-900">{skillGroup.category}: </span>
                  <span className="text-gray-700">{skillGroup.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedTemplateId === 'minimal-professional') {
      return (
        <div className="w-full h-full bg-white p-8 text-sm leading-tight font-sans" style={{ minHeight: '297mm' }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{personal_info.name || 'Your Name'}</h1>
            <p className="text-xl text-gray-600 mb-4">{personal_info.title || 'Professional Title'}</p>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              {personal_info.phone && (
                <span className="flex items-center">
                  <Phone className="w-3 h-3 mr-2" />
                  {personal_info.phone}
                </span>
              )}
              {personal_info.email && (
                <span className="flex items-center">
                  <Mail className="w-3 h-3 mr-2" />
                  {personal_info.email}
                </span>
              )}
              {personal_info.location && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-2" />
                  {personal_info.location}
                </span>
              )}
              {personal_info.linkedin && (
                <span className="flex items-center">
                  <Linkedin className="w-3 h-3 mr-2" />
                  {personal_info.linkedin}
                </span>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {summary && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300">PROFESSIONAL SUMMARY</h2>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Professional Experience */}
          {experience.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-1 border-b border-gray-300">PROFESSIONAL EXPERIENCE</h2>
              {experience.items.map((exp) => (
                <div key={exp.id} className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <p className="font-semibold text-gray-700">{exp.company}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600 text-sm font-medium">{exp.startDate} - {exp.endDate}</span>
                      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 text-sm leading-relaxed mt-2">
                      {exp.description.split('\n').map((line, index) => (
                        <p key={index} className="mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-1 border-b border-gray-300">EDUCATION</h2>
              {education.items.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600 text-sm">{edu.startDate} - {edu.endDate}</span>
                      {edu.gpa && <p className="text-gray-600 text-sm">CGPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.items.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-1 border-b border-gray-300">SKILLS</h2>
              {skills.items.map((skillGroup) => (
                <div key={skillGroup.id} className="mb-2">
                  <span className="font-bold text-gray-900">{skillGroup.category}: </span>
                  <span className="text-gray-700">{skillGroup.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedTemplateId === 'minimal-elegant') {
      return (
        <div className="w-full h-full bg-white p-8 text-sm leading-tight font-serif" style={{ minHeight: '297mm' }}>
          {/* Header */}
          <div className="text-center mb-10 pb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-wide">{personal_info.name || 'Your Name'}</h1>
            <p className="text-xl text-gray-600 mb-6 italic">{personal_info.title || 'Professional Title'}</p>
            <div className="flex justify-center items-center space-x-6 text-gray-600 mb-3">
              {personal_info.phone && <span>{personal_info.phone}</span>}
              {personal_info.email && <span>•</span>}
              {personal_info.email && <span>{personal_info.email}</span>}
              {personal_info.location && <span>•</span>}
              {personal_info.location && <span>{personal_info.location}</span>}
            </div>
            {(personal_info.linkedin || personal_info.github) && (
              <div className="flex justify-center items-center space-x-6 text-gray-600">
                {personal_info.linkedin && <span>{personal_info.linkedin}</span>}
                {personal_info.github && <span>•</span>}
                {personal_info.github && <span>{personal_info.github}</span>}
              </div>
            )}
          </div>

          {/* About */}
          {summary && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center tracking-widest">ABOUT</h2>
              <p className="text-gray-700 leading-relaxed text-justify">{summary}</p>
            </div>
          )}

          {/* Projects */}
          {projects.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center tracking-widest">PROJECTS</h2>
              <div className="space-y-4">
                {projects.items.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-bold text-gray-900">
                      {project.name} | <span className="italic font-normal">{project.description}</span>
                    </h3>
                    <ul className="text-gray-700 text-sm mt-1 space-y-1">
                      <li>• {project.description}</li>
                      {project.technologies && <li>• Technologies: {project.technologies}</li>}
                      {project.link && <li>• Link: {project.link}</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center tracking-widest">EDUCATION</h2>
              {education.items.map((edu) => (
                <div key={edu.id} className="text-center mb-4">
                  <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                  <p className="text-gray-700 italic">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                  <div className="flex justify-center space-x-4 text-gray-600 text-sm mt-1">
                    <span>{edu.startDate} - {edu.endDate}</span>
                    {edu.gpa && (
                      <>
                        <span>•</span>
                        <span>CGPA: {edu.gpa}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.items.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center tracking-widest">SKILLS</h2>
              {skills.items.map((skillGroup) => (
                <div key={skillGroup.id} className="mb-2 text-center">
                  <span className="font-bold text-gray-900">{skillGroup.category}: </span>
                  <span className="text-gray-700">{skillGroup.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default template if none selected
    return (
      <div className="w-full h-full bg-white p-8 text-sm leading-tight font-sans" style={{ minHeight: '297mm' }}>
        <div className="text-center py-20">
          <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Template Selected</h3>
          <p className="text-gray-600">Please select a template from the Design section</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">Resume Builder</h1>
          <p className="text-gray-600 dark:text-dark-text-tertiary">Create your professional resume with AI assistance</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover-bg transition-colors"
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreviewMode ? 'Edit Mode' : 'Preview Mode'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Panel */}
        {!isPreviewMode && (
          <div className="lg:col-span-1 space-y-6">
            {/* Section Navigation */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Resume Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'text-gray-600 dark:text-dark-text-tertiary hover:bg-gray-50 dark:hover:bg-dark-hover-bg hover:text-gray-900 dark:hover:text-dark-text-primary'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Section Content */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-6">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={resumeData.personal_info.name}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                    <input
                      type="text"
                      placeholder="Professional Title"
                      value={resumeData.personal_info.title}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, title: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={resumeData.personal_info.email}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={resumeData.personal_info.phone}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={resumeData.personal_info.location}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, location: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={resumeData.personal_info.linkedin}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, linkedin: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={resumeData.personal_info.github}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, github: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={resumeData.personal_info.website}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personal_info: { ...prev.personal_info, website: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              {activeSection === 'summary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Professional Summary</h3>
                    <button
                      onClick={async () => {
                        try {
                          const context = `Generate a professional summary for a ${resumeData.personal_info.title || 'professional'} with experience in ${resumeData.skills.items.map(s => s.skills.join(', ')).join(', ')}`;
                          const content = await generateAIContent('summary', context);
                          setResumeData(prev => ({ ...prev, summary: content }));
                        } catch (error) {
                          // Error already handled in generateAIContent
                        }
                      }}
                      disabled={isGeneratingAI}
                      className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium disabled:opacity-50"
                    >
                      {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>AI Generate</span>
                    </button>
                  </div>
                  <textarea
                    placeholder="Write a compelling professional summary that highlights your key achievements and skills..."
                    value={resumeData.summary}
                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                  />
                </div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Work Experience</h3>
                    <button
                      onClick={addExperience}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {resumeData.experience.items.map((exp) => (
                      <div key={exp.id} className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Experience Entry</h4>
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <input
                            type="text"
                            placeholder="Position Title"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Start Date"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="End Date"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Location"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-600 dark:text-dark-text-tertiary">Job Description</label>
                            <button
                              onClick={async () => {
                                try {
                                  const context = `Generate job description for ${exp.position} at ${exp.company}`;
                                  const content = await generateAIContent('experience', context);
                                  updateExperience(exp.id, 'description', content);
                                } catch (error) {
                                  // Error already handled in generateAIContent
                                }
                              }}
                              disabled={isGeneratingAI}
                              className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium disabled:opacity-50"
                            >
                              {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                              <span>AI Generate</span>
                            </button>
                          </div>
                          <textarea
                            placeholder="Describe your key responsibilities and achievements..."
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Education</h3>
                    <button
                      onClick={addEducation}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {resumeData.education.items.map((edu) => (
                      <div key={edu.id} className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Education Entry</h4>
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Institution Name"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="Field of Study"
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Start Date"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="End Date"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="GPA"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Location"
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Skills</h3>
                    <button
                      onClick={addSkillCategory}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {resumeData.skills.items.map((skill) => (
                      <div key={skill.id} className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Skill Category</h4>
                          <button
                            onClick={() => removeSkillCategory(skill.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Category (e.g., Programming Languages)"
                            value={skill.category}
                            onChange={(e) => updateSkillCategory(skill.id, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <input
                            type="text"
                            placeholder="Skills (comma-separated)"
                            value={skill.skills.join(', ')}
                            onChange={(e) => updateSkillCategory(skill.id, 'skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Projects</h3>
                    <button
                      onClick={addProject}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {resumeData.projects.items.map((project) => (
                      <div key={project.id} className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Project Entry</h4>
                          <button
                            onClick={() => removeProject(project.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Project Name"
                            value={project.name}
                            onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <textarea
                            placeholder="Project Description"
                            value={project.description}
                            onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                            className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <input
                            type="text"
                            placeholder="Technologies Used"
                            value={project.technologies}
                            onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <input
                            type="url"
                            placeholder="Project Link (optional)"
                            value={project.link}
                            onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Start Date"
                              value={project.startDate}
                              onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="End Date"
                              value={project.endDate}
                              onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Sections */}
              {activeSection === 'custom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Custom Sections</h3>
                    <button
                      onClick={addCustomSection}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Section</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {resumeData.custom_sections.map((section) => (
                      <div key={section.id} className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Custom Section</h4>
                          <button
                            onClick={() => removeCustomSection(section.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Section Title"
                            value={section.title}
                            onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          />
                          <select
                            value={section.type}
                            onChange={(e) => updateCustomSection(section.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                          >
                            <option value="text">Text Content</option>
                            <option value="list">List Items</option>
                          </select>
                          {section.type === 'text' ? (
                            <textarea
                              placeholder="Section content..."
                              value={section.content}
                              onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                          ) : (
                            <textarea
                              placeholder="List items (one per line)..."
                              value={section.items.join('\n')}
                              onChange={(e) => updateCustomSection(section.id, 'items', e.target.value.split('\n').filter(item => item.trim()))}
                              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Design */}
              {activeSection === 'design' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Design & Templates</h3>
                  
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
                      Template
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.values(templates).map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplateId(template.id);
                            // Load template sample data
                            const templateData = template.sampleData;
                            setResumeData(prev => ({
                              ...prev,
                              personal_info: { ...prev.personal_info, ...templateData.personal_info },
                              summary: prev.summary || templateData.summary,
                              experience: prev.experience.items.length > 0 ? prev.experience : { items: templateData.experience },
                              education: prev.education.items.length > 0 ? prev.education : { items: templateData.education },
                              skills: prev.skills.items.length > 0 ? prev.skills : { items: templateData.skills },
                              projects: prev.projects.items.length > 0 ? prev.projects : { items: templateData.projects },
                              template_id: template.id
                            }));
                          }}
                          className={`p-4 border-2 rounded-lg text-left transition-colors ${
                            selectedTemplateId === template.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-dark-border-primary hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">{template.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-text-tertiary mt-1">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Scheme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
                      Color Scheme
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {colorSchemes.map((scheme) => (
                        <button
                          key={scheme.name}
                          onClick={() => {
                            setSelectedColorScheme(scheme);
                            setResumeData(prev => ({ ...prev, color_scheme: scheme }));
                          }}
                          className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                            selectedColorScheme.name === scheme.name
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-dark-border-primary hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex space-x-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.primary }}></div>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.secondary }}></div>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.accent }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{scheme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className={`${isPreviewMode ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Resume Preview</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-dark-text-tertiary">
                  Template: {selectedTemplateId ? templates[selectedTemplateId as keyof typeof templates]?.name : 'None'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg p-4 overflow-auto" style={{ maxHeight: '800px' }}>
              <div 
                ref={previewRef}
                className="bg-white shadow-lg mx-auto"
                style={{ 
                  width: '210mm', 
                  minHeight: '297mm',
                  transform: isPreviewMode ? 'scale(1)' : 'scale(0.6)',
                  transformOrigin: 'top center',
                  margin: isPreviewMode ? '0 auto' : '0 auto'
                }}
              >
                {renderMinimalTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;