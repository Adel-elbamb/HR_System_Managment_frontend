import axios from "axios";

 export  async function getAttendences() {
    try {
      const { data } = await axios.get("http://127.0.0.1:3000/api/attendance");
      return data.data
    } catch (error) {
      console.error(
        " Error fetching attendances:",
        error.data?.data || error.message
      );
    }
  }



export async function createAttendence(payload) {
  try {
    const { data } = await axios.post("http://127.0.0.1:3000/api/attendance", payload);
    return data.attendance; 
  } catch (error) {
    console.error(" Error fetching attendances:", error.response?.data || error.message);
    throw error;
  }
}


export async function updateAttendence(id, payload) {
  try {

    const { data } = await axios.put(`http://127.0.0.1:3000/api/attendance/${id}`, payload);
    return data.attendance;

  } catch (error) {
    console.error("Error updating attendance:", error.response?.data || error.message);
    throw error;
  }
}

export async function deleteAttendence(id) {
  try {
   

    const { data } = await axios.delete(`http://127.0.0.1:3000/api/attendance/${id}`);
    return data.attendance;

  } catch (error) {
    console.error("Error deleting attendance:", error.response?.data || error.message);
    throw error;
  }
}
