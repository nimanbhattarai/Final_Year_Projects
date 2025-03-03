import { useState, useEffect } from "react";
import { studentApi } from "../../services/api";
import { User, Book, Award, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const StudentProfile = () => {
  const [profile, setProfile] = useState({});
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await studentApi.getProfile(studentId);
      let data = response.data;

      console.log("API Raw Response:", data); // Log raw response

      // 🔥 Ensure academic data is properly structured
      if (
        data.performance?.academic &&
        Array.isArray(data.performance.academic)
      ) {
        data.performance.academic = data.performance.academic.map(
          (yearData) => ({
            year: yearData.year,
            semesters: yearData.semesters.map((sem) => ({
              semester: sem.semester,
              subjects: sem.subjects || [],
            })),
          })
        );
      }

      console.log("Formatted Data:", data); // Check the new format

      setProfile(data);
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to fetch profile");
    }
  };

  if (!profile) {
    return <div className="animate-pulse">Loading profile...</div>;
  }

  // Ensure performance fields are properly handled
  const academicPerformance = profile.performance?.academic || {};
  const extracurricularActivities = profile.performance?.extracurricular || [];
  const teacherRemarks = profile.performance?.teacherRemarks || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <div className="flex items-center space-x-4">
            <User className="h-12 w-12 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-indigo-100">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Academic Performance Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Book className="h-5 w-5 mr-2 text-indigo-600" />
              Academic Performance
            </h2>
            <div className="space-y-4">
              {academicPerformance.length > 0 ? (
                academicPerformance.map((yearData) => (
                  <div key={yearData.year} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Year {yearData.year}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {yearData.semesters.map((semesterData) => (
                        <div
                          key={semesterData.semester}
                          className="bg-gray-50 p-3 rounded"
                        >
                          <h4 className="font-medium mb-2">
                            Semester {semesterData.semester}
                          </h4>
                          <div className="space-y-1">
                            {semesterData.subjects.length > 0 ? (
                              semesterData.subjects.map((subject, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between"
                                >
                                  <span className="text-gray-600">
                                    {subject.subject}
                                  </span>
                                  <span className="font-medium">
                                    {subject.marks}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-600">
                                No subjects available
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No academic data available.</p>
              )}
            </div>
          </div>

          {/* Extracurricular Activities Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-indigo-600" />
              Extra-Curricular Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extracurricularActivities.length > 0 ? (
                extracurricularActivities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">
                      {activity.activity}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Grade: {activity.grade}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">
                  No extracurricular data available.
                </p>
              )}
            </div>
          </div>

          {/* Teacher Remarks Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
              Teacher Remarks
            </h2>
            <div className="space-y-4">
              {teacherRemarks.length > 0 ? (
                teacherRemarks.map((remark, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {remark.teacherName}
                      </h3>
                      <span className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded">
                        Grade: {remark.grade}
                      </span>
                    </div>
                    <p className="text-gray-600">{remark.remark}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No teacher remarks available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
