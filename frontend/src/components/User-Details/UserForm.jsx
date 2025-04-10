import React, { useState } from 'react';
import axios from 'axios';

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
    'Information Retrieval (Elective I)',
    'IT Lab V',
    'Internship'
  ],
  8: [
    'Information Security',
    'Cyber Security (Elective II)',
    'Internet of Things',
    'Data Engineering',
    'IT Lab VI'
  ]
};

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photo: '',
    academic: Object.fromEntries(
      Object.entries(subjectsBySemester).map(([sem, subjects]) => [
        sem,
        subjects.map((subject) => ({ subject, marks: '' }))
      ])
    )
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const academicMap = new Map();
  
    Object.entries(formData.academic).forEach(([semester, subjects]) => {
      const year = Math.ceil(parseInt(semester, 10) / 2).toString();
  
      if (!academicMap.has(year)) {
        academicMap.set(year, new Map());
      }
  
      const semesterMap = academicMap.get(year);
      semesterMap.set(semester, subjects.map((subj) => ({
        subject: subj.subject,
        marks: parseFloat(subj.marks)
      })));
    });
  
    // Convert the nested Map structure to plain objects
    const academicObj = Object.fromEntries(
      [...academicMap.entries()].map(([year, semMap]) => [
        year,
        {
          semester: Object.fromEntries(semMap)
        }
      ])
    );
  
    const payload = {
      name: formData.name,
      email: formData.email,
      photo: formData.photo,
      performance: {
        academic: academicObj
      }
    };
  
    try {
      await axios.post('http://localhost:5000/api/student/data/add', payload);
      alert('Data submitted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Submission failed');
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit} className="p-4 mt-20 max-w-4xl mx-auto space-y-6">
      <div>
        <label>Name</label>
        <input type="text" name="name" className="border w-full p-2" onChange={handleBasicChange} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" className="border w-full p-2" onChange={handleBasicChange} required />
      </div>
      <div>
        <label>Photo URL</label>
        <input type="text" name="photo" className="border w-full p-2" onChange={handleBasicChange} />
      </div>

      {Object.entries(formData.academic).map(([sem, subjects]) => (
        <div key={sem} className="border p-4 rounded-lg shadow mt-4">
          <h3 className="text-lg font-semibold mb-2">Semester {sem}</h3>
          {subjects.map((subj, index) => (
            <div key={index} className="flex items-center gap-4 mb-2">
              <label className="w-1/2 text-sm">{subj.subject}</label>
              <input
                type="number"
                value={subj.marks}
                onChange={(e) => handleSubjectChange(sem, index, e.target.value)}
                className="border p-1 w-1/2"
                required
              />
            </div>
          ))}
        </div>
      ))}

      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
};

export default UserForm;