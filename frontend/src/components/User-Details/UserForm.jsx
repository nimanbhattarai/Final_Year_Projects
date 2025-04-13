import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const subjectsBySemester = {
  1: [
    'Mathematics For Computing - I',
    'Physics For Computing',
    'Computer Aided Drafting',
    'Digital Electronics',
    'Structured Programming',
    'Computer System Workshop Technology'
  ],
  2: [
    'Mathematics For Computing - II',
    'Organic & ElectroChemistry',
    'Electrical Technology',
    'Object Oriented Programming',
    'Programming Paradigms',
    'Web Programming'
  ],
  3: [
    'Discrete Structures & Graph Theory',
    'Data Structures',
    'Database Management Systems',
    'Software Engineering (ITC-I)',
    'Computer Communication & Network',
    'IT Lab I',
    'Vocational Course I'
  ],
  4: [
    'Infrastructure Management (ITC-II)',
    'Formal Languages',
    'Microcontrollers',
    'Applied Algorithms',
    'Operating Systems',
    'IT Lab II',
    'Vocational Course II'
  ],
  5: [
    'Human Computer Interaction',
    'AI & ML',
    'Computer Architecture & Organization',
    'Advanced DBMS (ITC-III)',
    'Mobile App Development',
    'IT Lab III',
    'Vocational Course III'
  ],
  6: [
    'Cloud Computing (ITC-IV)',
    'Software Testing & Quality Assurance',
    'Data Warehousing & Data Mining',
    'Quantitative Techniques, Communication and Values',
    'Agile Methodologies',
    'IT Lab IV',
    'Vocational Course IV'
  ],
  7: [
    'Project Planning & Management',
    'Web Services (ITC-V)',
    'Business Intelligence',
    '(Elective I)',
    'IT Lab V',
    'Internship'
  ],
  8: [
    'Information Security',
    '(Elective II)',
    'Internet of Things',
    'Data Engineering',
    'IT Lab VI'
  ]
};

const UserForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prn: '',
    rollNumber: '',
    address: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: '',
      github: ''
    },
    academic: Object.fromEntries(
      Object.entries(subjectsBySemester).map(([sem, subjects]) => [
        sem,
        subjects.map((subject) => ({ subject, marks: '' }))
      ])
    )
  });

  const totalSteps = Object.keys(subjectsBySemester).length + 1; // Basic info + semesters

  const handleSubjectChange = (semester, index, value) => {
    const updatedSemester = [...formData.academic[semester]];
    updatedSemester[index].marks = value;
    setFormData({
      ...formData,
      academic: {
        ...formData.academic,
        [semester]: updatedSemester
      }
    });
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData({
      ...formData,
      socialMedia: {
        ...formData.socialMedia,
        [platform]: value
      }
    });
  };

  const nextStep = () => {
    // Validate basic info before proceeding
    if (currentStep === 1) {
      // Check if all required fields are filled
      if (!formData.name || !formData.email || !formData.prn || !formData.rollNumber || !formData.address) {
        toast.error('Please fill all required fields in the Personal Information section');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!formData.name || !formData.email || !formData.prn || !formData.rollNumber || !formData.address) {
      toast.error('Please fill all required fields in the Personal Information section');
      setCurrentStep(1); // Go back to first step
      return;
    }
    
    // Create a flat object with subject marks
    const subjectData = {};
    
    // Map the subject codes to their corresponding marks
    const subjectCodes = {
      'Mathematics For Computing - I': 'math1',
      'Physics For Computing': 'physics',
      'Computer Aided Drafting': 'cad',
      'Digital Electronics': 'digitalElectronics',
      'Structured Programming': 'structuredProgramming',
      'Computer System Workshop Technology': 'cswt',
      'Mathematics For Computing - II': 'math2',
      'Organic & ElectroChemistry': 'chemistry',
      'Electrical Technology': 'electrical',
      'Object Oriented Programming': 'oop',
      'Programming Paradigms': 'pp',
      'Web Programming': 'wp',
      'Discrete Structures & Graph Theory': 'dsgt',
      'Data Structures': 'ds',
      'Database Management Systems': 'dbms',
      'Software Engineering (ITC-I)': 'se',
      'Computer Communication & Network': 'cn',
      'IT Lab I': 'itl_1',
      'Vocational Course I': 'vc_1',
      'Infrastructure Management (ITC-II)': 'infrastructureManagement',
      'Formal Languages': 'formalLanguages',
      'Microcontrollers': 'microcontrollers',
      'Applied Algorithms': 'appliedAlgorithms',
      'Operating Systems': 'operatingSystems',
      'IT Lab II': 'itl_2',
      'Vocational Course II': 'vc_2',
      'Human Computer Interaction': 'hci',
      'AI & ML': 'aiml',
      'Computer Architecture & Organization': 'cao',
      'Advanced DBMS (ITC-III)': 'advDbms',
      'Mobile App Development': 'mad',
      'IT Lab III': 'itl_3',
      'Vocational Course III': 'vc_3',
      'Cloud Computing (ITC-IV)': 'cloudComputing',
      'Software Testing & Quality Assurance': 'stqa',
      'Data Warehousing & Data Mining': 'dwdm',
      'Quantitative Techniques, Communication and Values': 'qt_communication_values',
      'Agile Methodologies': 'agile',
      'IT Lab IV': 'itl_4',
      'Vocational Course IV': 'vc_4',
      'Project Planning & Management': 'ppm',
      'Web Services (ITC-V)': 'webServices',
      'Business Intelligence': 'bi',
      '(Elective I)': 'ir',
      'IT Lab V': 'itl_5',
      'Internship': 'internship',
      'Information Security': 'infoSecurity',
      '(Elective II)': 'cyberSecurity',
      'Internet of Things': 'iot',
      'Data Engineering': 'dataEngineering',
      'IT Lab VI': 'itl_6'
    };

    // Convert the nested structure to flat structure
    Object.entries(formData.academic).forEach(([semester, subjects]) => {
      subjects.forEach(subject => {
        const code = subjectCodes[subject.subject];
        if (code) {
          subjectData[code] = subject.marks;
        }
      });
    });

    const payload = {
      name: formData.name,
      email: formData.email,
      prn: formData.prn,
      rollNumber: formData.rollNumber,
      address: formData.address,
      socialMedia: formData.socialMedia,
      ...subjectData
    };
  
    try {
      setSubmitting(true);
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post('https://final-year-projects-backend.onrender.com/api/student/data/add', payload);
      console.log('Server response:', response.data);
      setShowSuccess(true);
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        payload: payload
      });
      toast.error(`Submission failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name}
          onChange={handleBasicChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email}
          onChange={handleBasicChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PRN Number</label>
          <input 
            type="text" 
            name="prn" 
            value={formData.prn}
            onChange={handleBasicChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
          <input 
            type="text" 
            name="rollNumber" 
            value={formData.rollNumber}
            onChange={handleBasicChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea 
          name="address" 
          value={formData.address}
          onChange={handleBasicChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      {/* Social Media Profiles Section */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Social Media Profiles</h3>
        <p className="text-sm text-gray-500 mb-4">Add your social media profiles so teachers and administrators can view them</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                linkedin.com/in/
              </span>
              <input
                type="text"
                placeholder="username"
                value={formData.socialMedia.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')}
                onChange={(e) => handleSocialMediaChange('linkedin', `https://linkedin.com/in/${e.target.value}`)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                github.com/
              </span>
              <input
                type="text"
                placeholder="username"
                value={formData.socialMedia.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '')}
                onChange={(e) => handleSocialMediaChange('github', `https://github.com/${e.target.value}`)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Profile</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                instagram.com/
              </span>
              <input
                type="text"
                placeholder="username"
                value={formData.socialMedia.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')}
                onChange={(e) => handleSocialMediaChange('instagram', `https://instagram.com/${e.target.value}`)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Profile</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                facebook.com/
              </span>
              <input
                type="text"
                placeholder="username"
                value={formData.socialMedia.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//i, '')}
                onChange={(e) => handleSocialMediaChange('facebook', `https://facebook.com/${e.target.value}`)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSemester = (semester) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {formData.academic[semester].map((subject, index) => (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{subject.subject}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Enter SGPA (0-10)"
                value={subject.marks}
                onChange={(e) => handleSubjectChange(semester, index, e.target.value)}
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 text-gray-900"
                required
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900">Submission Successful!</h3>
      <p className="mt-2 text-sm text-gray-500">Thank you for submitting your academic records.</p>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  if (showSuccess) {
    return renderSuccess();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Academic Record Form</h1>
          <p className="text-gray-600 text-lg">Please fill in your academic details for all semesters</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              {currentStep === 1 ? 'Personal Information' : `Semester ${currentStep - 1} Details`}
            </h2>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {currentStep === 1 ? renderBasicInfo() : renderSemester(currentStep - 1)}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-600'
                }`}
                disabled={currentStep === 1}
              >
                Previous
              </button>
              
              {currentStep === totalSteps ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;