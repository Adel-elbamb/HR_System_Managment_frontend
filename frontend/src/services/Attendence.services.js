import axios from "axios";
const token = localStorage.getItem('token');
//  baseURL 
const api = axios.create({
  baseURL: "http://127.0.0.1:3000/api/attendance",
   headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

// Get all attendances
export async function getAttendences() {
  try {
    const { data } = await api.get("/");
  console.log(data.data);
  
    return data.data;
  } catch (error) {
    console.error(
      " Error fetching attendances:",
      error.response?.data || error.message
    );
  }
}

// Get attendance by ID
export async function getAttendencesById(id) {
  try {
    const { data } = await api.get(`/${id}`);
    return data.data;
  } catch (error) {
    console.error(
      " Error fetching attendance by ID:",
      error.response?.data || error.message
    );
  }
}

// Create new attendance
export async function createAttendence(payload) {
  try {
    const { data } = await api.post("/", payload);
    return data.attendance;
  } catch (error) {
    console.error(" Error creating attendance:", error.response?.data || error.message);
    throw error;
  }
}

// Update attendance
export async function updateAttendence(id, payload) {
  try {
    const { data } = await api.put(`/${id}`, payload);
    return data.attendance;
  } catch (error) {
    console.error(" Error updating attendance:", error.response?.data || error.message);
    throw error;
  }
}

// Delete attendance
export async function deleteAttendence(id) {
  try {
    const { data } = await api.delete(`/${id}`);
    return data.attendance;
  } catch (error) {
    console.error(" Error deleting attendance:", error.response?.data || error.message);
    throw error;
  }
}

// Get attendance with filter (by date)
export const getAttendencesWithFilter = async (startDate, endDate) => {
  try {
    const response = await api.get("/", {
      params: {
        startDate,
        endDate,
      },
    });

    console.log("Filtered Attendance:", response.data.data);
    return response.data.data;
  } catch (err) {
    console.error("Error in getAttendencesWithFilter:", err.response?.data || err.message);
  }
};

//

export const getAttendencesByEmployeeName = async (firstName) => {
  try {
    const response = await api.get("", {
      params: {
        firstName,
      },
    });

    // console.log("Attendance:", response.data.data);
    return response.data.data;
  } catch (err) {
    console.error("Error in getAttendencesByEmployeeName:", err.response?.data || err.message);
    return [];
  }
};
