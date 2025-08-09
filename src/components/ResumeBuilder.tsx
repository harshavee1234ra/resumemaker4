import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Eye, EyeOff, Plus, Trash2, Upload, Palette, Type, Layout, Zap, FileText, User, Mail, Phone, MapPin, Globe, Linkedin, Calendar, Building, GraduationCap, Award, Code, Briefcase, Star, Camera, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { PDFGenerator } from '../lib/pdfGenerator';
import { GeminiService } from '../lib/gemini';

type View = 'home' | 'dashboard' | 'builder' | 'analyzer' | 'templates' | 'pricing' | 'settings';

interface ResumeBuilderProps {
  onNavigate: (view: View) => void;
}

interface ResumeData {
  header: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    hasPhoto: boolean;
    photoUrl?: string;
  };
  summary: {
    text: string;
  };
  experience: {
    items: Array<{
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      location: string;
      description: string;
    }>;
  };
  education: {
    items: Array<{
      id: string;
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      gpa?: string;
    }>;
  };
  skills: {
    items: Array<{
      id: string;
      category: string;
      skills: string[];
    }>;
  };
  projects: {
    items: Array<{
      id: string;
      name: string;
      description: string;
      technologies: string;
      link?: string;
      startDate?: string;
      endDate?: string;
    }>;
  };
  customSections: Array<{
    id: string;
    title: string;
    icon: string;
    items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      date?: string;
      location?: string;
      description?: string;
      link?: string;
    }>;
    order: number;
    visible: boolean;
  }>;
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  templateId?: string;
  templateName?: string;
}

const getDefaultResumeData = (): ResumeData => ({
  header: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    hasPhoto: false,
    photoUrl: ''
  },
  summary: {
    text: ''
  },
  experience: {
    items: []
  },
  education: {
    items: []
  },
  skills: {
    items: []
  },
  projects: {
    items: []
  },
  customSections: [],
  colorScheme: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    text: '#1F2937',
    background: '#FFFFFF'
  }
});

const mergeWithDefaults = (data: any): ResumeData => {
  const defaults = getDefaultResumeData();
  
  return {
    header: {
      ...defaults.header,
      ...(data.header || {})
    },
    summary: {
      ...defaults.summary,
      ...(data.summary || {})
    },
    experience: {
      items: Array.isArray(data.experience?.items) ? data.experience.items : []
    },
    education: {
      items: Array.isArray(data.education?.items) ? data.education.items : []
    },
    skills: {
      items: Array.isArray(data.skills?.items) ? data.skills.items : []
    },
    projects: {
      items: Array.isArray(data.projects?.items) ? data.projects.items : []
    },
    customSections: Array.isArray(data.customSections) ? data.customSections : [],
    colorScheme: {
      ...defaults.colorScheme,
      ...(data.colorScheme || {})
    },
    templateId: data.templateId,
    templateName: data.templateName
  };
};

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>(getDefaultResumeData());
  const [activeSection, setActiveSection] = useState('header');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    customSections: true
  });
  const resumeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geminiService = new GeminiService();

  useEffect(() => {
    // Load template data from localStorage if available
    const templateData = localStorage.getItem('selectedTemplate');
    if (templateData) {
      try {
        const parsedData = JSON.parse(templateData);
        setResumeData(mergeWithDefaults(parsedData));
        localStorage.removeItem('selectedTemplate'); // Clear after loading
      } catch (error) {
        console.error('Error loading template data:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save your resume');
      return;
    }

    setIsSaving(true);
    try {
      const resumeToSave = {
        user_id: user.id,
        title: resumeData.header.name ? `${resumeData.header.name}'s Resume` : 'My Resume',
        personal_info: resumeData.header,
        summary: resumeData.summary.text,
        experience: resumeData.experience.items,
        education: resumeData.education.items,
        skills: resumeData.skills.items,
        projects: resumeData.projects.items,
        custom_sections: resumeData.customSections,
        is_published: true
      };

      const { error } = await supabase
        .from('resumes')
        .insert(resumeToSave);

      if (error) throw error;

      alert('Resume saved successfully!');
      onNavigate('dashboard');
    } catch (error: any) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeRef.current) return;

    try {
      const filename = resumeData.header.name 
        ? `${resumeData.header.name.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';
      
      await PDFGenerator.generateResumePDF(resumeRef.current, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `resume-photo-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setResumeData(prev => ({
          ...prev,
          header: {
            ...prev.header,
            photoUrl: data.publicUrl
          }
        }));
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const generateAIContent = async (section: string, context: string) => {
    setIsGenerating(true);
    try {
      const content = await geminiService.generateResumeContent(section, context);
      
      if (section === 'summary') {
        setResumeData(prev => ({
          ...prev,
          summary: { text: content }
        }));
      }
      // Add more sections as needed
      
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addExperience = () => {
    const newExp = {
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
      experience: {
        items: [...prev.experience.items, newExp]
      }
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: {
        items: prev.experience.items.map(exp => 
          exp.id === id ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: {
        items: prev.experience.items.filter(exp => exp.id !== id)
      }
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: {
        items: [...prev.education.items, newEdu]
      }
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: {
        items: prev.education.items.map(edu => 
          edu.id === id ? { ...edu, [field]: value } : edu
        )
      }
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: {
        items: prev.education.items.filter(edu => edu.id !== id)
      }
    }));
  };

  const addSkillCategory = () => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      category: '',
      skills: []
    };
    setResumeData(prev => ({
      ...prev,
      skills: {
        items: [...prev.skills.items, newSkill]
      }
    }));
  };

  const updateSkillCategory = (id: string, category: string, skillsText: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        items: prev.skills.items.map(skill => 
          skill.id === id ? { 
            ...skill, 
            category, 
            skills: skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0)
          } : skill
        )
      }
    }));
  };

  const removeSkillCategory = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        items: prev.skills.items.filter(skill => skill.id !== id)
      }
    }));
  };

  const addProject = () => {
    const newProject = {
      id: `project-${Date.now()}`,
      name: '',
      description: '',
      technologies: '',
      link: '',
      startDate: '',
      endDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: {
        items: [...prev.projects.items, newProject]
      }
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: {
        items: prev.projects.items.map(project => 
          project.id === id ? { ...project, [field]: value } : project
        )
      }
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: {
        items: prev.projects.items.filter(project => project.id !== id)
      }
    }));
  };

  const addCustomSection = () => {
    const newSection = {
      id: `custom-${Date.now()}`,
      title: 'Custom Section',
      icon: 'Star',
      items: [],
      order: resumeData.customSections.length,
      visible: true
    };
    setResumeData(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }));
  };

  const updateCustomSection = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeCustomSection = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(section => section.id !== id)
    }));
  };

  const addCustomSectionItem = (sectionId: string) => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: '',
      subtitle: '',
      date: '',
      location: '',
      description: '',
      link: ''
    };
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    }));
  };

  const updateCustomSectionItem = (sectionId: string, itemId: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item => 
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : section
      )
    }));
  };

  const removeCustomSectionItem = (sectionId: string, itemId: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === sectionId 
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      )
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateColorScheme = (colors: Partial<ResumeData['colorScheme']>) => {
    setResumeData(prev => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme!,
        ...colors
      }
    }));
  };

  const presetColors = [
    { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#0891B2', accent: '#06B6D4' },
    { name: 'Sunset Orange', primary: '#F97316', secondary: '#EC4899', accent: '#8B5CF6' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10B981', accent: '#34D399' },
    { name: 'Royal Purple', primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA' },
    { name: 'Coral Pink', primary: '#FF6B6B', secondary: '#FFB3B3', accent: '#FF8E8E' },
    { name: 'Midnight Blue', primary: '#1E3A8A', secondary: '#3B82F6', accent: '#60A5FA' },
    { name: 'Sage Green', primary: '#84CC16', secondary: '#A3E635', accent: '#BEF264' },
    { name: 'Rose Gold', primary: '#E11D48', secondary: '#F43F5E', accent: '#FB7185' }
  ];

  const iconOptions = [
    { name: 'Star', icon: Star },
    { name: 'Award', icon: Award },
    { name: 'Code', icon: Code },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Building', icon: Building },
    { name: 'FileText', icon: FileText },
    { name: 'User', icon: User }
  ];

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.name === iconName);
    return iconOption ? iconOption.icon : Star;
  };

  const sections = [
    { id: 'header', label: 'Header', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Star },
    { id: 'customSections', label: 'Custom Sections', icon: Plus }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">Resume Builder</h1>
          <p className="text-gray-600 dark:text-dark-text-tertiary">
            {resumeData.templateName ? `Using ${resumeData.templateName} template` : 'Create your professional resume'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover-bg transition-colors text-gray-700 dark:text-dark-text-secondary"
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Resume'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Editor Panel */}
        {!isPreviewMode && (
          <div className="lg:col-span-1 space-y-6">
            {/* Color Scheme Picker */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-6">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-gray-600 dark:text-dark-text-tertiary" />
                  <span className="font-semibold text-gray-900 dark:text-dark-text-primary">Color Scheme</span>
                </div>
                {showColorPicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showColorPicker && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {presetColors.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => updateColorScheme({
                          primary: preset.primary,
                          secondary: preset.secondary,
                          accent: preset.accent
                        })}
                        className="group relative"
                        title={preset.name}
                      >
                        <div className="w-full h-12 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-dark-border-primary hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                          <div className="h-full flex">
                            <div className="flex-1" style={{ backgroundColor: preset.primary }}></div>
                            <div className="flex-1" style={{ backgroundColor: preset.secondary }}></div>
                            <div className="flex-1" style={{ backgroundColor: preset.accent }}></div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Primary Color</label>
                      <input
                        type="color"
                        value={resumeData.colorScheme?.primary || '#3B82F6'}
                        onChange={(e) => updateColorScheme({ primary: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-dark-border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Secondary Color</label>
                      <input
                        type="color"
                        value={resumeData.colorScheme?.secondary || '#1E40AF'}
                        onChange={(e) => updateColorScheme({ secondary: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-dark-border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Navigation */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-6">
              <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Resume Sections</h3>
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
                    <section.icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Section Editor */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-6">
              {/* Header Section */}
              {activeSection === 'header' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Personal Information</h3>
                    <button
                      onClick={() => toggleSection('header')}
                      className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                    >
                      {expandedSections.header ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {expandedSections.header && (
                    <div className="space-y-4">
                      {/* Photo Section */}
                      {resumeData.header.hasPhoto && (
                        <div className="text-center">
                          <div className="relative inline-block">
                            {resumeData.header.photoUrl ? (
                              <img 
                                src={resumeData.header.photoUrl} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-dark-border-primary"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-dark-bg-tertiary flex items-center justify-center border-4 border-gray-200 dark:border-dark-border-primary">
                                <User className="w-12 h-12 text-gray-400 dark:text-dark-text-muted" />
                              </div>
                            )}
                            <label className={`absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              {uploadingPhoto ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Camera className="w-4 h-4" />
                              )}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handlePhotoUpload}
                                disabled={uploadingPhoto}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {resumeData.header.photoUrl && (
                            <button 
                              onClick={() => setResumeData(prev => ({
                                ...prev,
                                header: { ...prev.header, photoUrl: '' }
                              }))}
                              className="block mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mx-auto"
                            >
                              Remove photo
                            </button>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={resumeData.header.name}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            header: { ...prev.header, name: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                        />
                        <input
                          type="text"
                          placeholder="Professional Title"
                          value={resumeData.header.title}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            header: { ...prev.header, title: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={resumeData.header.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            header: { ...prev.header, email: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={resumeData.header.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            header: { ...prev.header, phone: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={resumeData.header.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            header: { ...prev.header, location: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                        />
                        <input
                          type="url"
                          placeholder="LinkedIn URL"
                          value={resumeData.header.linkedin}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            header: { ...prev.header, linkedin: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                        />
                        <input
                          type="url"
                          placeholder="Website URL"
                          value={resumeData.header.website}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            header: { ...prev.header, website: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted md:col-span-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Section */}
              {activeSection === 'summary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Professional Summary</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => generateAIContent('summary', `Professional with experience in ${resumeData.header.title || 'their field'}`)}
                        disabled={isGenerating}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        <span>AI Generate</span>
                      </button>
                      <button
                        onClick={() => toggleSection('summary')}
                        className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                      >
                        {expandedSections.summary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSections.summary && (
                    <textarea
                      placeholder="Write a compelling professional summary that highlights your key achievements and skills..."
                      value={resumeData.summary.text}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        summary: { text: e.target.value }
                      }))}
                      className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                    />
                  )}
                </div>
              )}

              {/* Experience Section */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Work Experience</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addExperience}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => toggleSection('experience')}
                        className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                      >
                        {expandedSections.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSections.experience && (
                    <div className="space-y-4">
                      {resumeData.experience.items.map((exp) => (
                        <div key={exp.id} className="p-4 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Experience Entry</h4>
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input
                              type="text"
                              placeholder="Company Name"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Position Title"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Start Date (e.g., Jan 2020)"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="End Date (e.g., Present)"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Location"
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted md:col-span-2"
                            />
                          </div>
                          <textarea
                            placeholder="Job description, key responsibilities, and quantified achievements..."
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Education Section */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Education</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addEducation}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => toggleSection('education')}
                        className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                      >
                        {expandedSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSections.education && (
                    <div className="space-y-4">
                      {resumeData.education.items.map((edu) => (
                        <div key={edu.id} className="p-4 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Education Entry</h4>
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Institution Name"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Field of Study"
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="GPA (optional)"
                              value={edu.gpa || ''}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Start Year"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="End Year"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills Section */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Skills</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addSkillCategory}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Category</span>
                      </button>
                      <button
                        onClick={() => toggleSection('skills')}
                        className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                      >
                        {expandedSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSections.skills && (
                    <div className="space-y-4">
                      {resumeData.skills.items.map((skill) => (
                        <div key={skill.id} className="p-4 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Skill Category</h4>
                            <button
                              onClick={() => removeSkillCategory(skill.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Category Name (e.g., Technical Skills)"
                              value={skill.category}
                              onChange={(e) => updateSkillCategory(skill.id, e.target.value, skill.skills.join(', '))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Skills (comma-separated)"
                              value={skill.skills.join(', ')}
                              onChange={(e) => updateSkillCategory(skill.id, skill.category, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Projects Section */}
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Projects</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addProject}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => toggleSection('projects')}
                        className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                      >
                        {expandedSections.projects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSections.projects && (
                    <div className="space-y-4">
                      {resumeData.projects.items.map((project) => (
                        <div key={project.id} className="p-4 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Project Entry</h4>
                            <button
                              onClick={() => removeProject(project.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Project Name"
                              value={project.name}
                              onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <textarea
                              placeholder="Project description and key achievements..."
                              value={project.description}
                              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                              className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="text"
                              placeholder="Technologies used"
                              value={project.technologies}
                              onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            <input
                              type="url"
                              placeholder="Project link (optional)"
                              value={project.link || ''}
                              onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Sections */}
              {activeSection === 'customSections' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Custom Sections</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addCustomSection}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Section</span>
                      </button>
                      <button
                        onClick={() => toggleSection('customSections')}
                        className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                      >
                        {expandedSections.customSections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSections.customSections && (
                    <div className="space-y-4">
                      {resumeData.customSections.map((section) => (
                        <div key={section.id} className="p-4 border border-gray-200 dark:border-dark-border-primary rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">Custom Section</h4>
                            <button
                              onClick={() => removeCustomSection(section.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <input
                              type="text"
                              placeholder="Section Title"
                              value={section.title}
                              onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                            />
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Icon</label>
                              <select
                                value={section.icon}
                                onChange={(e) => updateCustomSection(section.id, 'icon', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              >
                                {iconOptions.map((option) => (
                                  <option key={option.name} value={option.name}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Items</h5>
                              <button
                                onClick={() => addCustomSectionItem(section.id)}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Item</span>
                              </button>
                            </div>
                            
                            {section.items.map((item) => (
                              <div key={item.id} className="p-3 border border-gray-200 dark:border-dark-border-primary rounded bg-white dark:bg-dark-bg-secondary">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Item</span>
                                  <button
                                    onClick={() => removeCustomSectionItem(section.id, item.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Title"
                                    value={item.title}
                                    onChange={(e) => updateCustomSectionItem(section.id, item.id, 'title', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 dark:border-dark-border-primary rounded text-sm bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Subtitle"
                                    value={item.subtitle || ''}
                                    onChange={(e) => updateCustomSectionItem(section.id, item.id, 'subtitle', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 dark:border-dark-border-primary rounded text-sm bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Date"
                                    value={item.date || ''}
                                    onChange={(e) => updateCustomSectionItem(section.id, item.id, 'date', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 dark:border-dark-border-primary rounded text-sm bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Location"
                                    value={item.location || ''}
                                    onChange={(e) => updateCustomSectionItem(section.id, item.id, 'location', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 dark:border-dark-border-primary rounded text-sm bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                                  />
                                  <textarea
                                    placeholder="Description"
                                    value={item.description || ''}
                                    onChange={(e) => updateCustomSectionItem(section.id, item.id, 'description', e.target.value)}
                                    className="md:col-span-2 px-2 py-1 border border-gray-300 dark:border-dark-border-primary rounded text-sm h-16 resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                                  />
                                  <input
                                    type="url"
                                    placeholder="Link (optional)"
                                    value={item.link || ''}
                                    onChange={(e) => updateCustomSectionItem(section.id, item.id, 'link', e.target.value)}
                                    className="md:col-span-2 px-2 py-1 border border-gray-300 dark:border-dark-border-primary rounded text-sm bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume Preview */}
        <div className={`${isPreviewMode ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary p-8 shadow-lg">
            <div 
              ref={resumeRef}
              className="max-w-4xl mx-auto bg-white"
              style={{ 
                minHeight: '11in',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: resumeData.colorScheme?.text || '#1F2937',
                backgroundColor: resumeData.colorScheme?.background || '#FFFFFF'
              }}
            >
              {/* Header */}
              <div 
                className="relative p-8 text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${resumeData.colorScheme?.primary || '#3B82F6'}, ${resumeData.colorScheme?.secondary || '#1E40AF'})` 
                }}
              >
                <div className="flex items-center space-x-6">
                  {resumeData.header.hasPhoto && resumeData.header.photoUrl && (
                    <img 
                      src={resumeData.header.photoUrl} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2">{resumeData.header.name || 'Your Name'}</h1>
                    <h2 className="text-xl opacity-90 mb-4">{resumeData.header.title || 'Professional Title'}</h2>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {resumeData.header.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{resumeData.header.email}</span>
                        </div>
                      )}
                      {resumeData.header.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{resumeData.header.phone}</span>
                        </div>
                      )}
                      {resumeData.header.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{resumeData.header.location}</span>
                        </div>
                      )}
                      {resumeData.header.linkedin && (
                        <div className="flex items-center space-x-1">
                          <Linkedin className="w-4 h-4" />
                          <span>{resumeData.header.linkedin}</span>
                        </div>
                      )}
                      {resumeData.header.website && (
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{resumeData.header.website}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Summary */}
                {resumeData.summary.text && (
                  <section>
                    <h3 
                      className="text-xl font-bold mb-4 pb-2 border-b-2"
                      style={{ 
                        color: resumeData.colorScheme?.primary || '#3B82F6',
                        borderColor: resumeData.colorScheme?.primary || '#3B82F6'
                      }}
                    >
                      Professional Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{resumeData.summary.text}</p>
                  </section>
                )}

                {/* Experience */}
                {resumeData.experience.items.length > 0 && (
                  <section>
                    <h3 
                      className="text-xl font-bold mb-4 pb-2 border-b-2"
                      style={{ 
                        color: resumeData.colorScheme?.primary || '#3B82F6',
                        borderColor: resumeData.colorScheme?.primary || '#3B82F6'
                      }}
                    >
                      Work Experience
                    </h3>
                    <div className="space-y-6">
                      {resumeData.experience.items.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-lg font-semibold">{exp.position}</h4>
                              <p 
                                className="font-medium"
                                style={{ color: resumeData.colorScheme?.secondary || '#1E40AF' }}
                              >
                                {exp.company}
                              </p>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <p>{exp.startDate} - {exp.endDate}</p>
                              {exp.location && <p>{exp.location}</p>}
                            </div>
                          </div>
                          {exp.description && (
                            <div className="text-gray-700 whitespace-pre-line">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {resumeData.education.items.length > 0 && (
                  <section>
                    <h3 
                      className="text-xl font-bold mb-4 pb-2 border-b-2"
                      style={{ 
                        color: resumeData.colorScheme?.primary || '#3B82F6',
                        borderColor: resumeData.colorScheme?.primary || '#3B82F6'
                      }}
                    >
                      Education
                    </h3>
                    <div className="space-y-4">
                      {resumeData.education.items.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold">{edu.degree}</h4>
                            <p 
                              className="font-medium"
                              style={{ color: resumeData.colorScheme?.secondary || '#1E40AF' }}
                            >
                              {edu.institution}
                            </p>
                            {edu.field && <p className="text-gray-600">{edu.field}</p>}
                            {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <p>{edu.startDate} - {edu.endDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Skills */}
                {resumeData.skills.items.length > 0 && (
                  <section>
                    <h3 
                      className="text-xl font-bold mb-4 pb-2 border-b-2"
                      style={{ 
                        color: resumeData.colorScheme?.primary || '#3B82F6',
                        borderColor: resumeData.colorScheme?.primary || '#3B82F6'
                      }}
                    >
                      Skills
                    </h3>
                    <div className="space-y-3">
                      {resumeData.skills.items.map((skill) => (
                        <div key={skill.id}>
                          <h4 
                            className="font-semibold mb-2"
                            style={{ color: resumeData.colorScheme?.secondary || '#1E40AF' }}
                          >
                            {skill.category}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {skill.skills.map((skillItem, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: resumeData.colorScheme?.accent || '#60A5FA' }}
                              >
                                {skillItem}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {resumeData.projects.items.length > 0 && (
                  <section>
                    <h3 
                      className="text-xl font-bold mb-4 pb-2 border-b-2"
                      style={{ 
                        color: resumeData.colorScheme?.primary || '#3B82F6',
                        borderColor: resumeData.colorScheme?.primary || '#3B82F6'
                      }}
                    >
                      Projects
                    </h3>
                    <div className="space-y-4">
                      {resumeData.projects.items.map((project) => (
                        <div key={project.id}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold">{project.name}</h4>
                            {project.link && (
                              <a 
                                href={project.link}
                                className="text-sm underline"
                                style={{ color: resumeData.colorScheme?.secondary || '#1E40AF' }}
                              >
                                View Project
                              </a>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-gray-700 mb-2">{project.description}</p>
                          )}
                          {project.technologies && (
                            <p className="text-sm text-gray-600">
                              <strong>Technologies:</strong> {project.technologies}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Custom Sections */}
                {resumeData.customSections.filter(section => section.visible && section.items.length > 0).map((section) => {
                  const IconComponent = getIconComponent(section.icon);
                  return (
                    <section key={section.id}>
                      <h3 
                        className="text-xl font-bold mb-4 pb-2 border-b-2 flex items-center space-x-2"
                        style={{ 
                          color: resumeData.colorScheme?.primary || '#3B82F6',
                          borderColor: resumeData.colorScheme?.primary || '#3B82F6'
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span>{section.title}</span>
                      </h3>
                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <div key={item.id}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-lg font-semibold">{item.title}</h4>
                                {item.subtitle && (
                                  <p 
                                    className="font-medium"
                                    style={{ color: resumeData.colorScheme?.secondary || '#1E40AF' }}
                                  >
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                {item.date && <p>{item.date}</p>}
                                {item.location && <p>{item.location}</p>}
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-gray-700 mb-2">{item.description}</p>
                            )}
                            {item.link && (
                              <a 
                                href={item.link}
                                className="text-sm underline"
                                style={{ color: resumeData.colorScheme?.secondary || '#1E40AF' }}
                              >
                                View Link
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;