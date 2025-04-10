import { useState, useEffect } from "react";
import { studentApi } from "../../services/api";
import { User, Book, Award, MessageSquare, GraduationCap, Facebook, Instagram, Linkedin, Github } from "lucide-react";
import toast from "react-hot-toast";
import PhotoUpload from './PhotoUpload';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await studentApi.getProfile(studentId);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchProfile();
    }
  }, [studentId]);

  const handlePhotoUpdate = (photoUrl) => {
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        photo: photoUrl
      };
    });
    toast.success("Photo updated successfully");
  };

  if (loading) {
    return <div className="text-center my-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center my-8">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center my-8">No profile data available</div>;
  }

  // Ensure performance fields are properly handled
  const academicPerformance = profile.performance?.academic || {};
  const extracurricularActivities = profile.performance?.extracurricular || [];
  const teacherRemarks = profile.performance?.teacherRemarks || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg">
              {profile.photo ? (
                <div className="relative">
                  <img 
                    src={profile.photo} 
                    alt={profile.name} 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                  />
                  <PhotoUpload 
                    currentPhoto={profile.photo} 
                    studentId={studentId}
                    onPhotoUpdate={handlePhotoUpdate}
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-md">
                    <User className="h-16 w-16 text-white/60" />
                  </div>
                  <PhotoUpload 
                    currentPhoto={null} 
                    studentId={studentId}
                    onPhotoUpdate={handlePhotoUpdate}
                  />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-indigo-100 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />
                {profile.email}
              </p>
            </div>
          </div>
        </div>
        
        {/* Social Media Links */}
        {profile.socialMedia && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              {profile.socialMedia.facebook && (
                <a 
                  href={profile.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="text-sm">Facebook</span>
                </a>
              )}
              {profile.socialMedia.instagram && (
                <a 
                  href={profile.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {profile.socialMedia.linkedin && (
                <a 
                  href={profile.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-700 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="text-sm">LinkedIn</span>
                </a>
              )}
              {profile.socialMedia.github && (
                <a 
                  href={profile.socialMedia.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm">GitHub</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Academic Performance Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Book className="h-5 w-5 mr-2 text-indigo-600" />
              Academic Performance
            </h2>
          </div>

          <div className="p-6">
            {academicPerformance.length > 0 ? (
              <div className="space-y-6">
                {academicPerformance.map((yearData) => (
                  <div key={yearData.year} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Year {(yearData.year).split("r")[1]}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 p-4">
                      {yearData.semesters.map((semesterData) => (
                        <div
                          key={semesterData.semester}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-100">
                            Semester {(semesterData.semester).split("r")[1]}
                          </h4>
                          <div className="space-y-2">
                            {semesterData.subjects.length > 0 ? (
                              semesterData.subjects.map((subject, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-gray-50"
                                >
                                  <span className="text-gray-700">{subject.subject}</span>
                                  <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                    {subject.marks}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm italic">No subjects available</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Book className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No academic data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Extracurricular Activities Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-indigo-600" />
              Extra-Curricular Activities
            </h2>
          </div>

          <div className="p-6">
            {extracurricularActivities.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {extracurricularActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{activity.activity}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        Grade: {activity.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No extracurricular data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Teacher Remarks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
              Teacher Remarks
            </h2>
          </div>

          <div className="p-6">
            {teacherRemarks.length > 0 ? (
              <div className="space-y-4">
                {teacherRemarks.map((remark, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {remark.teacherName.charAt(0)}
                        </div>
                        <h3 className="font-medium text-gray-900">{remark.teacherName}</h3>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        Grade: {remark.grade}
                      </span>
                    </div>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{remark.remark}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No teacher remarks available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;