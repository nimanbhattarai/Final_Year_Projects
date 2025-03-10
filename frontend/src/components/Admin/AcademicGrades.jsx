import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Trash2, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const AcademicGrades = ({ selectedStudent }) => {
  const [existingGrades, setExistingGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedStudent && selectedStudent._id) {
      fetchExistingGrades();
    } else {
      setLoading(false);
    }
  }, [selectedStudent]);

  const fetchExistingGrades = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStudentGrades(selectedStudent._id);
      
      // Ensure we have valid data
      const academicData = response.data.performance?.academic || {};
      
      // Process the data to handle MongoDB Map structure
      const processedData = {};
      
      // Extract years from the data and sort them numerically
      const yearsList = Object.keys(academicData)
        .filter(key => !key.startsWith('$') && key !== 'toJSON') // Filter out Mongoose internals
        .sort((a, b) => Number(a) - Number(b));
      
      // Process each year's data
      yearsList.forEach(year => {
        const yearData = academicData[year];
        if (yearData && yearData.semester) {
          processedData[year] = {
            semester: {}
          };
          
          // Process semester data
          Object.keys(yearData.semester)
            .filter(sem => !sem.startsWith('$') && sem !== 'toJSON')
            .forEach(sem => {
              processedData[year].semester[sem] = yearData.semester[sem];
            });
        }
      });
      
      setExistingGrades(processedData);
      setYears(yearsList);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to fetch existing grades');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (year) => {
    if (!window.confirm(`Are you sure you want to delete all data for Year ${year}?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Get all semesters for this year
      const yearData = existingGrades[year] || {};
      const semesterData = yearData.semester || {};
      const semesters = Object.keys(semesterData).filter(sem => !sem.startsWith('$'));
      
      if (semesters.length === 0) {
        toast.error('No semesters found for this year');
        setLoading(false);
        return;
      }
      
      // Delete each semester
      for (const semester of semesters) {
        await adminApi.deleteAcademicGrades({
          studentId: selectedStudent._id,
          year,
          semester,
        });
      }
      
      toast.success(`Year ${year} data deleted successfully`);
      
      // Update local state
      const updatedGrades = { ...existingGrades };
      delete updatedGrades[year];
      setExistingGrades(updatedGrades);
      
      const updatedYears = years.filter(y => y !== year);
      setYears(updatedYears);
    } catch (error) {
      console.error('Error deleting year:', error);
      toast.error('Failed to delete year data');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStudent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a student from the Student Details section first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Calculate which years are available to add
  const availableYears = ['1', '2', '3', '4'].filter(year => !years.includes(year));

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Years</h2>
        
        {years.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No academic data available for this student.</p>
            <p className="text-gray-500 mt-2">Add a new academic year to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {years.map(year => {
              const yearData = existingGrades[year] || {};
              const semesterData = yearData.semester || {};
              const semesterCount = Object.keys(semesterData).filter(sem => !sem.startsWith('$')).length;
              
              return (
                <div key={year} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Year {year}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteYear(year)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                        title="Delete Year"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/admin/academic/${year}`}
                        state={{ student: selectedStudent, yearData: existingGrades[year] }}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50"
                        title="View Details"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600">
                      {semesterCount} semester(s)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Year Section */}
        {availableYears.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Add New Academic Year</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {availableYears.map(year => (
                <Link
                  key={year}
                  to={`/admin/academic/${year}`}
                  state={{ student: selectedStudent, yearData: {} }}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2 text-indigo-600" />
                  <span className="font-medium text-indigo-600">Year {year}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicGrades;