import { useState, useEffect } from 'react';
import axios from 'axios';

const useAutoFill = (employeeId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) {
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/forms/auto-fill/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching auto-fill data:", err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  return { data, loading, error };
};

export default useAutoFill;
