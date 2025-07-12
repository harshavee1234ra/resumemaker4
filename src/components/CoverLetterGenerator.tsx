import React, { useState, useEffect } from 'react';
import { FileText, Download, Edit3, Save, Loader2, Sparkles, ArrowLeft, Copy, Eye, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { GeminiService } from '../lib/gemini';
import { PDFGenerator } from '../lib/pdfGenerator';

type View = 'home' | 'dashboard' | 'builder' | 'analyzer' | 'templates' | 'pricing' | 'settings';

interface CoverLetterGeneratorProps {
  onNavigate: (view: View) => void;
}

interface Resume {
  id: string;
  title: string;
  personal_info?: any;
  summary?: string;
  experience?: any;
  education?: any;
  skills?: any;
  projects?: any;
}

interface CoverLetter {
  id: string;
  title: string;
  content: string;
  job_description: string;
  resume_id: string;
  created_at: string;
  updated_at: string;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'manage'>('generate');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [currentCoverLetter, setCurrentCoverLetter] = useState<CoverLetter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const geminiService = new GeminiService();

  useEffect(() => {
    if (user) {
      fetchResumes();
      fetchCoverLetters();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load resumes');
    }
  };

  const fetchCoverLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCoverLetters(data || []);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      setError('Failed to load cover letters');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId || !jobDescription.trim() || !companyName.trim() || !position.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      if (!selectedResume) {
        throw new Error('Selected resume not found');
      }

      const resumeData = {
        header: selectedResume.personal_info || {},
        summary: { text: selectedResume.summary || '' },
        experience: selectedResume.experience || { items: [] },
        education: selectedResume.education || { items: [] },
        skills: selectedResume.skills || { items: [] },
        projects: selectedResume.projects || { items: [] }
      };

      const coverLetterContent = await geminiService.generateCoverLetter(
        resumeData,
        jobDescription,
        companyName,
        position
      );

      setGeneratedContent(coverLetterContent);
      setEditingContent(coverLetterContent);
      setEditingTitle(`Cover Letter - ${position} at ${companyName}`);
      setActiveTab('edit');
    } catch (error: any) {
      setError(error.message || 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editingContent.trim() || !editingTitle.trim() || !selectedResumeId) {
      setError('Please provide a title and content');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const coverLetterData = {
        user_id: user?.id,
        resume_id: selectedResumeId,
        title: editingTitle,
        content: editingContent,
        job_description: jobDescription
      };

      let result;
      if (currentCoverLetter) {
        // Update existing cover letter
        result = await supabase
          .from('cover_letters')
          .update(coverLetterData)
          .eq('id', currentCoverLetter.id)
          .select()
          .single();
      } else {
        // Create new cover letter
        result = await supabase
          .from('cover_letters')
          .insert(coverLetterData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setCurrentCoverLetter(result.data);
      await fetchCoverLetters();
      alert('Cover letter saved successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to save cover letter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (content?: string, title?: string) => {
    const downloadContent = content || editingContent;
    const downloadTitle = title || editingTitle || 'cover-letter';
    
    if (!downloadContent.trim()) {
      setError('No content to download');
      return;
    }

    setIsDownloading(true);
    try {
      const filename = `${downloadTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      await PDFGenerator.generateCoverLetterPDF(downloadContent, filename);
    } catch (error) {
      setError('Failed to download cover letter');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = (coverLetter: CoverLetter) => {
    setCurrentCoverLetter(coverLetter);
    setEditingContent(coverLetter.content);
    setEditingTitle(coverLetter.title);
    setJobDescription(coverLetter.job_description);
    setSelectedResumeId(coverLetter.resume_id);
    setActiveTab('edit');
  };

  const handleDelete = async (coverLetterId: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', coverLetterId);

      if (error) throw error;

      await fetchCoverLetters();
      alert('Cover letter deleted successfully!');
    } catch (error) {
      setError('Failed to delete cover letter');
    }
  };

  const handleNewCoverLetter = () => {
    setCurrentCoverLetter(null);
    setEditingContent('');
    setEditingTitle('');
    setJobDescription('');
    setCompanyName('');
    setPosition('');
    setSelectedResumeId('');
    setGeneratedContent('');
    setActiveTab('generate');
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Cover letter copied to clipboard!');
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-dark-text-tertiary">Loading cover letter generator...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">AI Cover Letter Generator</h1>
        <p className="text-gray-600 dark:text-dark-text-tertiary">Generate personalized cover letters using AI based on your resume and job description</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary mb-8">
        <div className="flex border-b border-gray-200 dark:border-dark-border-primary">
          {[
            { id: 'generate', label: 'Generate New', icon: Sparkles },
            { id: 'edit', label: 'Edit & Preview', icon: Edit3 },
            { id: 'manage', label: 'Manage Letters', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-dark-text-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Select Resume
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary"
                    >
                      <option value="">Choose a resume...</option>
                      {resumes.map(resume => (
                        <option key={resume.id} value={resume.id}>
                          {resume.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Google, Microsoft, Apple"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                        Position Title *
                      </label>
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g., Software Engineer, Marketing Manager"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the complete job description here. Include requirements, responsibilities, and company information for the best results..."
                      className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedResumeId || !jobDescription.trim() || !companyName.trim() || !position.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Cover Letter</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column - Tips */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>AI Generation Tips</span>
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-dark-text-secondary">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Include the complete job description for better personalization</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Make sure your resume is up-to-date with relevant experience</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>The AI will match your skills to job requirements automatically</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>You can edit and customize the generated content</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Save multiple versions for different applications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Edit Cover Letter</h2>
                  <p className="text-gray-600 dark:text-dark-text-tertiary">Customize your AI-generated cover letter</p>
                </div>
                <button
                  onClick={handleNewCoverLetter}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Letter</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Cover Letter Title
                    </label>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="e.g., Cover Letter - Software Engineer at Google"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Content
                    </label>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      placeholder="Your cover letter content will appear here..."
                      className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted font-mono text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !editingContent.trim() || !editingTitle.trim()}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownload()}
                      disabled={isDownloading || !editingContent.trim()}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyToClipboard(editingContent)}
                      disabled={!editingContent.trim()}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Eye className="w-5 h-5 text-gray-600 dark:text-dark-text-tertiary" />
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">Preview</h3>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-dark-text-secondary leading-relaxed">
                      {editingContent || 'Your cover letter preview will appear here...'}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Saved Cover Letters</h2>
                  <p className="text-gray-600 dark:text-dark-text-tertiary">Manage your saved cover letters</p>
                </div>
                <button
                  onClick={handleNewCoverLetter}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Cover Letter</span>
                </button>
              </div>

              {coverLetters.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-dark-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">No cover letters yet</h3>
                  <p className="text-gray-600 dark:text-dark-text-tertiary mb-6">Generate your first AI-powered cover letter</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    Generate Cover Letter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coverLetters.map(coverLetter => (
                    <div key={coverLetter.id} className="bg-white dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-primary rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-1 line-clamp-2">
                            {coverLetter.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">
                            {new Date(coverLetter.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-gray-400 dark:text-dark-text-muted flex-shrink-0" />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 dark:text-dark-text-secondary line-clamp-3">
                          {coverLetter.content.substring(0, 150)}...
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(coverLetter)}
                          className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDownload(coverLetter.content, coverLetter.title)}
                          className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => copyToClipboard(coverLetter.content)}
                          className="flex items-center space-x-1 text-gray-600 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary text-sm font-medium"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => handleDelete(coverLetter.id)}
                          className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;