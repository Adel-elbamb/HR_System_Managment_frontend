import axios from "axios";

const token = localStorage.getItem('token');
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

// Function to search for all employees by name
const searchEmployeesByName = async (employeeName) => {
  try {
    const response = await api.get("/employee");
    const employees = response.data.data || [];
    
    // Search for all employees by name (case-insensitive)
    const foundEmployees = employees.filter(emp => 
      emp.firstName?.toLowerCase().includes(employeeName.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(employeeName.toLowerCase()) ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(employeeName.toLowerCase())
    );
    
    console.log(`Searching for "${employeeName}": Found ${foundEmployees.length} employees`);
    return foundEmployees;
  } catch (error) {
    console.error("Error searching for employees:", error);
    return [];
  }
};

// Simple HR-friendly responses without any technical details
const getHRFriendlyResponse = (question) => {
  const lowerQuestion = question.toLowerCase();
  
  console.log("Checking for HR-friendly response for:", question);
  
  if (lowerQuestion.includes('add') && lowerQuestion.includes('employee')) {
    return `📝 **Adding a New Employee:**

1. Go to **Employees** in the main menu
2. Click **"Add Employee"**
3. Fill in the employee details
4. Click **"Save"**

That's it! The employee is now in the system.`;
  }
  
  if (lowerQuestion.includes('update') || lowerQuestion.includes('edit') || lowerQuestion.includes('modify')) {
    return `✏️ **Updating Employee Information:**

1. Go to **Employees**
2. Find the employee you want to update
3. Click **"Edit"** next to their name
4. Make your changes
5. Click **"Save"**

You can update salary, department, contact info, and working hours.`;
  }
  
  if (lowerQuestion.includes('delete') || lowerQuestion.includes('remove')) {
    return `🗑️ **Removing an Employee:**

1. Go to **Employees**
2. Find the employee you want to remove
3. Click **"Delete"** next to their name
4. Confirm the deletion

**Note:** Employees can be restored later if needed.`;
  }
  
  if (lowerQuestion.includes('restore')) {
    return `🔄 **Restoring a Deleted Employee:**

1. Go to **Employees**
2. Click **"Deleted Employees"** tab
3. Find the employee you want to restore
4. Click **"Restore"**

The employee will be back in the system with all their information.`;
  }
  
  if (lowerQuestion.includes('search') || lowerQuestion.includes('find')) {
    return `🔍 **Finding Employees:**

• Use the **search bar** in the Employees section
• **Filter by department** using the dropdown
• **Ask me directly** - type "Tell me about employee [Name]"

I'll show you all matching employees.`;
  }
  
  if (lowerQuestion.includes('salary') || lowerQuestion.includes('payroll')) {
    return `💰 **Salary and Payroll:**

**How it works:**
• Employee salaries are set when adding/editing employees
• Payroll is calculated automatically each month
• Overtime pay is added for extra hours worked
• Deductions are made for late arrivals and absences

**To view payroll:**
1. Go to **Payroll** section
2. Select the month
3. View the calculations

Everything is calculated automatically!`;
  }
  
  if (lowerQuestion.includes('overtime') || lowerQuestion.includes('extra hours')) {
    return `⏰ **Overtime Pay:**

**How overtime works:**
• Employees check in and out daily
• Any hours worked beyond their regular schedule count as overtime
• Overtime pay is calculated automatically
• Added to their monthly salary

**To check overtime:**
1. Go to **Attendance** section
2. View daily records
3. See overtime hours for each employee

The system handles all calculations automatically!`;
  }
  
  if (lowerQuestion.includes('attendance')) {
    return `⏰ **Attendance Management:**

**Daily Process:**
• Employees check in and out each day
• Late arrivals are tracked automatically
• Overtime hours are calculated
• Absences are marked automatically

**To view attendance:**
1. Go to **Attendance** section
2. See daily records for all employees
3. Check late arrivals and overtime

Everything is tracked automatically!`;
  }
  
  if (lowerQuestion.includes('department')) {
    return `🏢 **Department Management:**

**Creating a Department:**
1. Go to **Department** section
2. Click **"Add Department"**
3. Enter department name
4. Click **"Save"**

**Assigning Employees:**
1. Edit an employee's information
2. Select their department from the dropdown
3. Save the changes

That's it!`;
  }
  
  if (lowerQuestion.includes('holiday')) {
    return `🎉 **Holiday Management:**

**Adding a Holiday:**
1. Go to **Holiday** section
2. Click **"Add Holiday"**
3. Enter holiday name and date
4. Click **"Save"**

**Important:**
• Only future dates can be set as holidays
• Employees are automatically marked as "on leave" on holidays
• This affects attendance and payroll calculations

Simple and automatic!`;
  }
  
  if (lowerQuestion.includes('calculate') || lowerQuestion.includes('calculation')) {
    return `🧮 **How Calculations Work:**

**Salary Calculation:**
• Base salary + Overtime pay - Deductions = Net salary
• Overtime = Extra hours × Overtime rate
• Deductions = Late hours × Deduction rate
• Absence deductions = Absent days × Daily rate

**Everything is automatic!** You don't need to calculate anything manually.`;
  }
  
  if (lowerQuestion.includes('late') || lowerQuestion.includes('deduction')) {
    return `⏰ **Late Arrivals and Deductions:**

**How it works:**
• Employees should arrive on time
• Late arrivals are tracked automatically
• Deductions are calculated based on late hours
• Affects monthly salary

**To check late arrivals:**
1. Go to **Attendance** section
2. View daily records
3. See late arrival times for each employee

The system handles all deductions automatically!`;
  }
  
  console.log("No HR-friendly response found for:", question);
  return null; // Let AI handle other questions
};

const askChatBot = async (question) => {
  try {
    console.log("Sending question to chatbot:", question);
    
    // Check if the question is asking about a specific employee
    const employeeNameMatch = question.match(/(?:employee|worker|staff|person)\s+(?:named\s+)?([a-zA-Z\s]+)/i);
    
    if (employeeNameMatch) {
      const employeeName = employeeNameMatch[1].trim();
      console.log("Searching for employees:", employeeName);
      
      const employees = await searchEmployeesByName(employeeName);
      
      if (employees.length > 0) {
        // Return all matching employees
        let answer = `📄 **Employees Found (${employees.length}):**\n\n`;
        
        employees.forEach((employee, index) => {
          answer += `**${index + 1}. ${employee.firstName} ${employee.lastName}**\n`;
          answer += `👤 **Name:** ${employee.firstName} ${employee.lastName}\n`;
          answer += `📧 **Email:** ${employee.email}\n`;
          answer += `📞 **Phone:** ${employee.phone || 'Not provided'}\n`;
          answer += `🏢 **Department:** ${employee.department || 'Not assigned'}\n`;
          answer += `💰 **Salary:** ${employee.salary ? `$${employee.salary}` : 'Not set'}\n`;
          answer += `⏰ **Working Hours:** ${employee.workingHours || 'Not set'}\n`;
          if (employee.status === 'deleted') {
            answer += `⚠️ **Status:** Deleted (can be restored)\n`;
          }
          answer += `\n`;
        });
        
        return {
          success: true,
          message: "Employees found",
          data: {
            question,
            answer: answer,
            timestamp: new Date().toISOString(),
            employeeData: employees
          }
        };
      } else {
        // No employees found, provide simple HR guidance
        console.log("No employees found, providing HR guidance");
        return {
          success: true,
          message: "No employees found",
          data: {
            question,
            answer: `No employees found with name "${employeeName}".\n\n📝 **Adding a New Employee:**

1. Go to **Employees** in the main menu
2. Click **"Add Employee"**
3. Fill in the employee details
4. Click **"Save"**

That's it! The employee is now in the system.`,
            timestamp: new Date().toISOString()
          }
        };
      }
    }
    
    // Check for HR-friendly responses first
    console.log("Checking for HR-friendly response");
    const hrResponse = getHRFriendlyResponse(question);
    if (hrResponse) {
      console.log("Using HR-friendly response");
      return {
        success: true,
        message: "HR guidance provided",
        data: {
          question,
          answer: hrResponse,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // For any other questions, provide simple HR guidance instead of AI
    console.log("Providing simple HR guidance");
    return {
      success: true,
      message: "HR guidance provided",
      data: {
        question,
        answer: `I can help you with HR tasks! Here are some things I can assist with:

📝 **Employee Management:**
• Adding new employees
• Updating employee information
• Finding employee details
• Managing departments

💰 **Payroll & Attendance:**
• Understanding salary calculations
• Checking attendance records
• Managing overtime
• Holiday management

🔍 **To search for employees:**
• Use the search bar in the Employees section
• Ask me directly: "Tell me about employee [Name]"
• Filter by department using the dropdown

**Need help with something specific?** Just ask me about any HR task!`,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Chatbot service error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    });
    
    // Show the actual error message from backend
    const backendError = error.response?.data?.message || error.response?.data?.error || error.message;
    console.error("Backend error message:", backendError);
    
    throw new Error(backendError || "Failed to get response from chatbot");
  }
};

export default askChatBot;