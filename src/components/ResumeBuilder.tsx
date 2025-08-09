import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Eye, Plus, Trash2, Edit3, Loader2, Sparkles, ArrowLeft, FileText, User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Award, Code, Palette, Layout, Camera, Upload } from 'lucide-react';
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
  photo?: string;
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
  icon: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  customSections: CustomSection[];
}

interface TemplateData {
  id: string;
  name: string;
  color: string;
  style: string;
  hasPhoto: boolean;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'custom' | 'preview'>('personal');
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      photo: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    customSections: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [colorScheme, setColorScheme] = useState({
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff'
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState('My Resume');
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const geminiService = new GeminiService();

  useEffect(() => {
    // Load template data if coming from templates
    const templateId = localStorage.getItem('selectedTemplateId');
    const templateDataStr = localStorage.getItem('selectedTemplateData');
    
    if (templateId && templateDataStr) {
      try {
        const templateData = JSON.parse(templateDataStr);
        setSelectedTemplate(templateData);
        
        // Set color scheme based on template
        setColorScheme(getTemplateColorScheme(templateData));
        
        // Load sample data for the template
        loadTemplateData(templateData);
        
        // Clear the stored template data
        localStorage.removeItem('selectedTemplateId');
        localStorage.removeItem('selectedTemplateData');
      } catch (error) {
        console.error('Error loading template data:', error);
      }
    }

    // Load existing resume for editing
    const editingId = localStorage.getItem('editingResumeId');
    if (editingId && user) {
      setEditingResumeId(editingId);
      loadExistingResume(editingId);
      localStorage.removeItem('editingResumeId');
    }
  }, [user]);

  const getTemplateColorScheme = (template: TemplateData) => {
    const colorSchemes: { [key: string]: any } = {
      'ocean-breeze': {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#38bdf8',
        text: '#0f172a',
        background: '#ffffff'
      },
      'sunset-glow': {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        text: '#1f2937',
        background: '#ffffff'
      },
      'forest-mist': {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        text: '#1f2937',
        background: '#ffffff'
      },
      'royal-purple': {
        primary: '#7c3aed',
        secondary: '#6d28d9',
        accent: '#8b5cf6',
        text: '#1f2937',
        background: '#ffffff'
      },
      'coral-elegance': {
        primary: '#f43f5e',
        secondary: '#e11d48',
        accent: '#fb7185',
        text: '#1f2937',
        background: '#ffffff'
      },
      'midnight-blue': {
        primary: '#1e40af',
        secondary: '#1d4ed8',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff'
      },
      'sage-green': {
        primary: '#16a34a',
        secondary: '#15803d',
        accent: '#22c55e',
        text: '#1f2937',
        background: '#ffffff'
      },
      'rose-gold': {
        primary: '#be185d',
        secondary: '#a21caf',
        accent: '#ec4899',
        text: '#1f2937',
        background: '#ffffff'
      }
    };

    return colorSchemes[template.id] || {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      text: '#1f2937',
      background: '#ffffff'
    };
  };

  const loadTemplateData = (template: TemplateData) => {
    // Load sample data based on template
    const sampleData: ResumeData = {
      personalInfo: {
        name: 'Your Name',
        title: 'Professional Title',
        email: 'your.email@example.com',
        phone: '+1 (555) 123-4567',
        location: 'City, State',
        linkedin: 'linkedin.com/in/yourname',
        github: 'github.com/yourname',
        website: 'yourwebsite.com',
        photo: template.hasPhoto ? '' : undefined
      },
      summary: 'Professional summary highlighting your key achievements, skills, and career objectives. Tailor this section to match your target role and showcase your unique value proposition.',
      experience: [
        {
          id: '1',
          company: 'Company Name',
          position: 'Job Title',
          startDate: '2022',
          endDate: 'Present',
          location: 'City, State',
          description: '• Achieved significant results through strategic initiatives\n• Led cross-functional teams to deliver high-impact projects\n• Improved processes resulting in measurable outcomes'
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University Name',
          degree: 'Bachelor of Science',
          field: 'Your Field of Study',
          startDate: '2018',
          endDate: '2022',
          gpa: '3.8',
          location: 'City, State'
        }
      ],
      skills: [
        {
          id: '1',
          category: 'Technical Skills',
          skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4']
        },
        {
          id: '2',
          category: 'Soft Skills',
          skills: ['Leadership', 'Communication', 'Problem Solving', 'Teamwork']
        }
      ],
      projects: [
        {
          id: '1',
          name: 'Project Name',
          description: 'Brief description of the project, technologies used, and key achievements.',
          technologies: 'Technology 1, Technology 2, Technology 3',
          link: 'https://project-link.com',
          startDate: '2023',
          endDate: '2023'
        }
      ],
      customSections: []
    };

    setResumeData(sampleData);
    setResumeTitle(`${template.name} Resume`);
  };

  const loadExistingResume = async (resumeId: string) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;

      if (data) {
        setResumeData({
          personalInfo: data.personal_info || resumeData.personalInfo,
          summary: data.summary || '',
          experience: data.experience?.items || [],
          education: data.education?.items || [],
          skills: data.skills?.items || [],
          projects: data.projects?.items || [],
          customSections: data.custom_sections || []
        });
        setResumeTitle(data.title);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      setError('Failed to load resume');
    }
  };

  const generateAIContent = async (section: string, context: string) => {
    setIsGeneratingAI(true);
    setError(null);

    try {
      const content = await geminiService.generateResumeContent(section, context);
      
      // Apply the generated content based on section
      if (section === 'summary') {
        setResumeData(prev => ({ ...prev, summary: content }));
      }
      
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      setError('Failed to generate content. Please try again.');
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
        user_id: user.id,
        title: resumeTitle,
        personal_info: resumeData.personalInfo,
        summary: resumeData.summary,
        experience: { items: resumeData.experience },
        education: { items: resumeData.education },
        skills: { items: resumeData.skills },
        projects: { items: resumeData.projects },
        custom_sections: resumeData.customSections,
        is_published: true
      };

      let result;
      if (editingResumeId) {
        result = await supabase
          .from('resumes')
          .update(resumeDataToSave)
          .eq('id', editingResumeId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('resumes')
          .insert(resumeDataToSave)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      alert('Resume saved successfully!');
      onNavigate('dashboard');
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

    setIsDownloading(true);
    try {
      const filename = `${resumeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      await PDFGenerator.generateResumePDF(previewRef.current, filename);
    } catch (error) {
      console.error('Error downloading resume:', error);
      setError('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
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
          personalInfo: { ...prev.personalInfo, photo: data.publicUrl }
        }));
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
    }
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      location: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: Date.now().toString(),
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
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkillCategory = () => {
    const newSkill: SkillCategory = {
      id: Date.now().toString(),
      category: '',
      skills: []
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const updateSkillCategory = (id: string, category: string, skills: string[]) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, category, skills } : skill
      )
    }));
  };

  const removeSkillCategory = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const addProject = () => {
    const newProject: ProjectItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: '',
      link: '',
      startDate: '',
      endDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      icon: 'Award'
    };
    setResumeData(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }));
  };

  const updateCustomSection = (id: string, field: keyof CustomSection, value: string) => {
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

  const renderResumePreview = () => {
    const { personalInfo, summary, experience, education, skills, projects, customSections } = resumeData;

    // Apply template-specific styling
    const getTemplateStyles = () => {
      if (!selectedTemplate) return {};

      const baseStyles = {
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        color: colorScheme.text,
        backgroundColor: colorScheme.background
      };

      switch (selectedTemplate.style) {
        case 'modern':
          return {
            ...baseStyles,
            background: `linear-gradient(135deg, ${colorScheme.background} 0%, ${colorScheme.primary}10 100%)`
          };
        case 'creative':
          return {
            ...baseStyles,
            background: `linear-gradient(45deg, ${colorScheme.background} 0%, ${colorScheme.accent}05 100%)`
          };
        case 'minimal':
          return {
            ...baseStyles,
            backgroundColor: '#ffffff',
            color: '#000000'
          };
        default:
          return baseStyles;
      }
    };

    const templateStyles = getTemplateStyles();

    return (
      <div 
        ref={previewRef}
        className="w-full max-w-4xl mx-auto bg-white shadow-lg"
        style={{
          ...templateStyles,
          minHeight: '297mm',
          width: '210mm',
          padding: '20mm',
          margin: '0 auto',
          fontSize: '11pt',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* Header */}
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          borderBottom: selectedTemplate?.style === 'minimal' ? '1px solid #000' : `2px solid ${colorScheme.primary}`,
          paddingBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            {selectedTemplate?.hasPhoto && personalInfo.photo && (
              <img 
                src={personalInfo.photo} 
                alt="Profile" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: `3px solid ${colorScheme.primary}`
                }} 
              />
            )}
            <div>
              <h1 style={{ 
                margin: '0', 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.primary
              }}>
                {personalInfo.name || 'Your Name'}
              </h1>
              <h2 style={{ 
                margin: '5px 0', 
                fontSize: '18px', 
                color: selectedTemplate?.style === 'minimal' ? '#333' : colorScheme.secondary,
                fontWeight: 'normal'
              }}>
                {personalInfo.title || 'Professional Title'}
              </h2>
            </div>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.email && personalInfo.phone && <span> | </span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {(personalInfo.email || personalInfo.phone) && personalInfo.location && <span> | </span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
          {(personalInfo.linkedin || personalInfo.github || personalInfo.website) && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
              {personalInfo.linkedin && (personalInfo.github || personalInfo.website) && <span> | </span>}
              {personalInfo.github && <span>{personalInfo.github}</span>}
              {personalInfo.github && personalInfo.website && <span> | </span>}
              {personalInfo.website && <span>{personalInfo.website}</span>}
            </div>
          )}
        </header>

        {/* Summary */}
        {summary && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '10px', 
              textTransform: 'uppercase', 
              borderBottom: selectedTemplate?.style === 'minimal' ? '1px solid #000' : `1px solid ${colorScheme.secondary}`,
              paddingBottom: '5px',
              color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.primary
            }}>
              Professional Summary
            </h3>
            <p style={{ margin: '0', textAlign: 'justify', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
              {summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '15px', 
              textTransform: 'uppercase', 
              borderBottom: selectedTemplate?.style === 'minimal' ? '1px solid #000' : `1px solid ${colorScheme.secondary}`,
              paddingBottom: '5px',
              color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.primary
            }}>
              Professional Experience
            </h3>
            {experience.map((exp, index) => (
              <div key={exp.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                  <div>
                    <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
                      {exp.position || 'Position'}
                    </h4>
                    <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: selectedTemplate?.style === 'minimal' ? '#333' : colorScheme.secondary }}>
                      {exp.company || 'Company'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#666' : colorScheme.secondary }}>
                      {exp.startDate || ''} - {exp.endDate || 'Present'}
                    </p>
                    {exp.location && (
                      <p style={{ margin: '0', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#666' : colorScheme.secondary }}>
                        {exp.location}
                      </p>
                    )}
                  </div>
                </div>
                {exp.description && (
                  <div style={{ fontSize: '13px', marginTop: '8px', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
                    {exp.description.split('\n').map((line, i) => (
                      <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '15px', 
              textTransform: 'uppercase', 
              borderBottom: selectedTemplate?.style === 'minimal' ? '1px solid #000' : `1px solid ${colorScheme.secondary}`,
              paddingBottom: '5px',
              color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.primary
            }}>
              Education
            </h3>
            {education.map((edu, index) => (
              <div key={edu.id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
                      {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
                    </h4>
                    <p style={{ margin: '0', fontSize: '14px', color: selectedTemplate?.style === 'minimal' ? '#333' : colorScheme.secondary }}>
                      {edu.institution || 'Institution'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#666' : colorScheme.secondary }}>
                      {edu.startDate || ''} - {edu.endDate || 'Present'}
                    </p>
                    {edu.gpa && (
                      <p style={{ margin: '0', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#666' : colorScheme.secondary }}>
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '15px', 
              textTransform: 'uppercase', 
              borderBottom: selectedTemplate?.style === 'minimal' ? '1px solid #000' : `1px solid ${colorScheme.secondary}`,
              paddingBottom: '5px',
              color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.primary
            }}>
              Skills
            </h3>
            {skills.map((skillGroup, index) => (
              <div key={skillGroup.id} style={{ marginBottom: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
                  {skillGroup.category || 'Skills'}
                </h4>
                <p style={{ margin: '0', fontSize: '13px', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
                  {skillGroup.skills.join(', ')}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '15px', 
              textTransform: 'uppercase', 
              borderBottom: selectedTemplate?.style === 'minimal' ? '1px solid #000' : `1px solid ${colorScheme.secondary}`,
              paddingBottom: '5px',
              color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.primary
            }}>
              Projects
            </h3>
            {projects.map((project, index) => (
              <div key={project.id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                  <div>
                    <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
                      {project.name || 'Project Name'}
                    </h4>
                    {project.technologies && (
                      <p style={{ margin: '0', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#666' : colorScheme.secondary }}>
                        {project.technologies}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {(project.startDate || project.endDate) && (
                      <p style={{ margin: '0', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#666' : colorScheme.secondary }}>
                        {project.startDate || ''} - {project.endDate || 'Present'}
                      </p>
                    )}
                    {project.link && (
                      <p style={{ margin: '0', fontSize: '12px', color: selectedTemplate?.style === 'minimal' ? '#666' : colorScheme.secondary }}>
                        {project.link}
                      </p>
                    )}
                  </div>
                </div>
                {project.description && (
                  <p style={{ margin: '0', fontSize: '13px', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Custom Sections */}
        {customSections.map((section, index) => (
          <section key={section.id} style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '15px', 
              textTransform: 'uppercase', 
              borderBottom: selectedTemplate?.style === 'minimal' ? '1px solid #000' : `1px solid ${colorScheme.secondary}`,
              paddingBottom: '5px',
              color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.primary
            }}>
              {section.title}
            </h3>
            <div style={{ fontSize: '13px', color: selectedTemplate?.style === 'minimal' ? '#000' : colorScheme.text }}>
              {section.content.split('\n').map((line, i) => (
                <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  const sidebarSections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Award },
    { id: 'custom', label: 'Custom Sections', icon: Plus },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      {/* Header */}
      <div className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-dark-border-primary"></div>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-dark-text-primary"
              placeholder="Resume Title"
            />
          </div>
          <div className="flex items-center space-x-3">
            {selectedTemplate && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Layout className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">{selectedTemplate.name}</span>
              </div>
            )}
            <button
              onClick={() => onNavigate('templates')}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Change Template</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-dark-bg-secondary border-r border-gray-200 dark:border-dark-border-primary overflow-y-auto">
          <nav className="p-4 space-y-2">
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover-bg'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Form Section */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            {activeSection === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Personal Information</h2>
                  
                  {/* Photo Upload */}
                  {selectedTemplate?.hasPhoto && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Profile Photo
                      </label>
                      <div className="flex items-center space-x-4">
                        {resumeData.personalInfo.photo ? (
                          <img 
                            src={resumeData.personalInfo.photo} 
                            alt="Profile" 
                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-dark-border-primary"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-dark-bg-tertiary flex items-center justify-center border-4 border-gray-200 dark:border-dark-border-primary">
                            <User className="w-8 h-8 text-gray-400 dark:text-dark-text-muted" />
                          </div>
                        )}
                        <div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Upload Photo</span>
                          </button>
                          <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
                            JPG, PNG, WebP up to 2MB
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.name}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Professional Title *
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.title}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, title: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, location: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.github}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, github: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="github.com/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, website: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Summary */}
            {activeSection === 'summary' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Professional Summary</h2>
                  <button
                    onClick={() => generateAIContent('summary', `Professional with experience in ${resumeData.personalInfo.title || 'your field'}`)}
                    disabled={isGeneratingAI}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isGeneratingAI ? 'Generating...' : 'AI Generate'}</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    Write a compelling professional summary that highlights your key achievements and career objectives
                  </label>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    placeholder="Write a compelling professional summary that showcases your expertise, key achievements, and career objectives. Focus on what makes you unique and valuable to potential employers."
                  />
                </div>
              </div>
            )}

            {/* Experience */}
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Work Experience</h2>
                  <button
                    onClick={addExperience}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Experience</span>
                  </button>
                </div>
                
                {resumeData.experience.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No work experience added yet</p>
                    <p className="text-sm">Click "Add Experience" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                            Experience {index + 1}
                          </h3>
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Job Title *
                            </label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Company *
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Company Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Start Date
                            </label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Jan 2022"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              End Date
                            </label>
                            <input
                              type="text"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Present"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="City, State"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                            Job Description & Achievements
                          </label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                            placeholder="• Describe your key responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Include quantifiable results when possible&#10;• Focus on impact and outcomes"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Education */}
            {activeSection === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Education</h2>
                  <button
                    onClick={addEducation}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Education</span>
                  </button>
                </div>
                
                {resumeData.education.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No education added yet</p>
                    <p className="text-sm">Click "Add Education" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                            Education {index + 1}
                          </h3>
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Institution *
                            </label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="University Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Degree *
                            </label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Bachelor of Science"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Field of Study
                            </label>
                            <input
                              type="text"
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Computer Science"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              GPA
                            </label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="3.8"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Start Date
                            </label>
                            <input
                              type="text"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="2018"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              End Date
                            </label>
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="2022"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {activeSection === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Skills</h2>
                  <button
                    onClick={addSkillCategory}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
                
                {resumeData.skills.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No skills added yet</p>
                    <p className="text-sm">Click "Add Category" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resumeData.skills.map((skill, index) => (
                      <div key={skill.id} className="bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                            Skill Category {index + 1}
                          </h3>
                          <button
                            onClick={() => removeSkillCategory(skill.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Category Name *
                            </label>
                            <input
                              type="text"
                              value={skill.category}
                              onChange={(e) => updateSkillCategory(skill.id, e.target.value, skill.skills)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="e.g., Programming Languages, Soft Skills"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Skills (comma-separated) *
                            </label>
                            <input
                              type="text"
                              value={skill.skills.join(', ')}
                              onChange={(e) => updateSkillCategory(skill.id, skill.category, e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="JavaScript, Python, React, Node.js"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Projects */}
            {activeSection === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Projects</h2>
                  <button
                    onClick={addProject}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>
                
                {resumeData.projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No projects added yet</p>
                    <p className="text-sm">Click "Add Project" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resumeData.projects.map((project, index) => (
                      <div key={project.id} className="bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                            Project {index + 1}
                          </h3>
                          <button
                            onClick={() => removeProject(project.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Project Name *
                            </label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Project Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Project Link
                            </label>
                            <input
                              type="url"
                              value={project.link}
                              onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="https://project-link.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Start Date
                            </label>
                            <input
                              type="text"
                              value={project.startDate}
                              onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Jan 2023"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              End Date
                            </label>
                            <input
                              type="text"
                              value={project.endDate}
                              onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Present"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Technologies Used
                            </label>
                            <input
                              type="text"
                              value={project.technologies}
                              onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="React, Node.js, MongoDB"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                            Project Description
                          </label>
                          <textarea
                            value={project.description}
                            onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                            className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                            placeholder="Describe the project, your role, key features, and achievements..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Sections */}
            {activeSection === 'custom' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Custom Sections</h2>
                  <button
                    onClick={addCustomSection}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </button>
                </div>
                
                {resumeData.customSections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                    <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No custom sections added yet</p>
                    <p className="text-sm">Add sections like Certifications, Awards, Languages, etc.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {resumeData.customSections.map((section, index) => (
                      <div key={section.id} className="bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                            Custom Section {index + 1}
                          </h3>
                          <button
                            onClick={() => removeCustomSection(section.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Section Title *
                            </label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="e.g., Certifications, Awards, Languages"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                              Content *
                            </label>
                            <textarea
                              value={section.content}
                              onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary"
                              placeholder="Add your content here. Use bullet points for better formatting:&#10;• Item 1&#10;• Item 2&#10;• Item 3"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="w-1/2 bg-gray-100 dark:bg-dark-bg-tertiary p-6 overflow-y-auto">
            <div className="sticky top-0 bg-gray-100 dark:bg-dark-bg-tertiary pb-4 mb-4 border-b border-gray-200 dark:border-dark-border-primary">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Live Preview</h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">See how your resume looks in real-time</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%' }}>
              {renderResumePreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;