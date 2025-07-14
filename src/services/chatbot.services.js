import axios from "axios";

const token = localStorage.getItem("token");
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

// Function to search for all employees by name
const searchEmployeesByName = async (employeeName, searchType = "all") => {
  try {
    const response = await api.get("/employee");
    const employees = response.data.data || [];

    console.log(`🔍 Searching for "${employeeName}" (${searchType})`);
    console.log(`📊 Total employees in system: ${employees.length}`);

    let foundEmployees;

    if (searchType === "firstname") {
      // Search only by first name (exact match or starts with)
      foundEmployees = employees.filter(
        (emp) =>
          emp.firstName?.toLowerCase() === employeeName.toLowerCase() ||
          emp.firstName?.toLowerCase().startsWith(employeeName.toLowerCase())
      );
    } else {
      // More precise search - prioritize exact matches
      foundEmployees = employees.filter((emp) => {
        const firstName = emp.firstName?.toLowerCase() || "";
        const lastName = emp.lastName?.toLowerCase() || "";
        const fullName = `${firstName} ${lastName}`.trim();
        const searchTerm = employeeName.toLowerCase();

        // Exact matches first
        if (
          firstName === searchTerm ||
          lastName === searchTerm ||
          fullName === searchTerm
        ) {
          return true;
        }

        // Only include if the search term is a complete word match
        // This prevents "ahmed" from matching "adhm" or "ad hadmmams"
        const firstNameWords = firstName.split(" ");
        const lastNameWords = lastName.split(" ");
        const fullNameWords = fullName.split(" ");

        return (
          firstNameWords.some((word) => word === searchTerm) ||
          lastNameWords.some((word) => word === searchTerm) ||
          fullNameWords.some((word) => word === searchTerm)
        );
      });
    }

    console.log(
      `✅ Found ${foundEmployees.length} employees for "${employeeName}"`
    );
    if (foundEmployees.length > 0) {
      console.log(
        `📋 Matches:`,
        foundEmployees.map((emp) => `${emp.firstName} ${emp.lastName}`)
      );
    }

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

  if (lowerQuestion.includes("add") && lowerQuestion.includes("employee")) {
    return `🎉 **Adding a New Team Member:**

1. Go to **Employees** in the main menu
2. Click **"Add Employee"**
3. Fill in their details
4. Click **"Save"**

**That's it!** Your new team member is now in the system! 🚀

**💡 Pro tip:** You can also edit their info anytime if you need to update something! 😊`;
  }

  if (
    lowerQuestion.includes("update") ||
    lowerQuestion.includes("edit") ||
    lowerQuestion.includes("modify")
  ) {
    return `✏️ **Updating Team Member Info:**

1. Go to **Employees**
2. Find the person you want to update
3. Click **"Edit"** next to their name
4. Make your changes
5. Click **"Save"**

**You can update:**
• Salary 💰
• Department 🏢
• Contact info 📞
• Working hours ⏰

**💡 Easy peasy!** Everything gets updated instantly! 😊`;
  }

  if (lowerQuestion.includes("delete") || lowerQuestion.includes("remove")) {
    return `🗑️ **Removing a Team Member:**

1. Go to **Employees**
2. Find the person you want to remove
3. Click **"Delete"** next to their name
4. Confirm the deletion

**💡 Don't worry!** They can be restored later if you change your mind! 😊

**Note:** This just hides them from the active list - they're not gone forever!`;
  }

  if (lowerQuestion.includes("restore")) {
    return `🔄 **Bringing Back a Team Member:**

1. Go to **Employees**
2. Click **"Deleted Employees"** tab
3. Find the person you want to bring back
4. Click **"Restore"**

**🎉 Welcome back!** They'll be back in the system with all their info intact! 😊

**💡 It's like they never left!** All their data is preserved.`;
  }

  if (lowerQuestion.includes("search") || lowerQuestion.includes("find")) {
    return `🔍 **Finding Employees:**

• Use the **search bar** in the Employees section
• **Filter by department** using the dropdown
• **Ask me directly** - type "Tell me about employee [Name]"

I'll show you all matching employees.`;
  }

  if (lowerQuestion.includes("salary") || lowerQuestion.includes("payroll")) {
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

  if (
    lowerQuestion.includes("overtime") ||
    lowerQuestion.includes("extra hours")
  ) {
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

  if (lowerQuestion.includes("attendance")) {
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

  if (lowerQuestion.includes("department")) {
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

**💡 Pro tip:** You can also view all departments and see which employees belong to each one! 😊`;
  }

  if (lowerQuestion.includes("holiday")) {
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

  if (
    lowerQuestion.includes("calculate") ||
    lowerQuestion.includes("calculation")
  ) {
    return `🧮 **How Calculations Work:**

**Salary Calculation:**
• Base salary + Overtime pay - Deductions = Net salary
• Overtime = Extra hours × Overtime rate
• Deductions = Late hours × Deduction rate
• Absence deductions = Absent days × Daily rate

**Everything is automatic!** You don't need to calculate anything manually.`;
  }

  if (lowerQuestion.includes("late") || lowerQuestion.includes("deduction")) {
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

// List of exact fixed questions (case-insensitive, trimmed)
const fixedQuestions = [
  "i want info about ahmed",
  "tell me about ahmed",
  "how do i add a new employee?",
  "how do i calculate overtime pay?",
  "what are the attendance rules?",
  "how do i add a new department?",
];

const askChatBot = async (question) => {
  try {
    console.log("Sending question to chatbot:", question);

    // Only answer with static response if exact match (case-insensitive, trimmed)
    const normalizedQuestion = question.trim().toLowerCase();
    if (fixedQuestions.includes(normalizedQuestion)) {
      const hrResponse = getHRFriendlyResponse(question);
      if (hrResponse) {
        return {
          success: true,
          message: "HR-friendly static response",
          data: {
            question,
            answer: hrResponse,
            timestamp: new Date().toISOString(),
          },
        };
      }
    }

    // Check if the question is asking about a specific employee - more flexible pattern with typos
    // Only match if it's clearly asking about a person, not general topics
    const employeeNameMatch = question.match(
      /(?:employee|worker|staff|person|info\w*\s+about|tell\s+me\s+about|show\s+me|find|search\s+for)\s+(?:named\s+)?([a-zA-Z\s]+)/i
    );

    // Check if this is actually about a person (not a general topic)
    const isPersonQuery =
      employeeNameMatch &&
      !question.toLowerCase().includes("department") &&
      !question.toLowerCase().includes("salary") &&
      !question.toLowerCase().includes("payroll") &&
      !question.toLowerCase().includes("attendance") &&
      !question.toLowerCase().includes("overtime") &&
      !question.toLowerCase().includes("holiday") &&
      !question.toLowerCase().includes("add") &&
      !question.toLowerCase().includes("edit") &&
      !question.toLowerCase().includes("delete") &&
      !question.toLowerCase().includes("remove") &&
      !question.toLowerCase().includes("restore");

    if (isPersonQuery) {
      let employeeName = employeeNameMatch[1].trim();

      // Clean up the name - remove "employee" if it's part of the name
      employeeName = employeeName
        .replace(/\b(employee|worker|staff|person)\b/gi, "")
        .trim();

      console.log("🔍 Original question:", question);
      console.log("📝 Extracted name:", employeeNameMatch[1]);
      console.log("✨ Cleaned name:", employeeName);

      // Check if the name is empty after cleaning
      if (!employeeName) {
        console.log("⚠️ Warning: Name is empty after cleaning!");
        return {
          success: true,
          message: "No name provided",
          data: {
            question,
            answer: `🤔 **I didn't catch the name you're looking for!**

Could you try asking again? For example:
• "Tell me about Ahmed"
• "I want info about John"
• "Show me employee Sarah"

**💡 Make sure to include the person's name in your question!** 😊`,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Check if user wants first name only search
      const isFirstNameOnly =
        question.toLowerCase().includes("first name") ||
        question.toLowerCase().includes("only") ||
        question.toLowerCase().includes("exactly") ||
        question.toLowerCase().includes("just");

      const searchType = isFirstNameOnly ? "firstname" : "all";
      console.log("🔎 Search type:", searchType);

      const employees = await searchEmployeesByName(employeeName, searchType);

      if (employees.length > 0) {
        // Return all matching employees
        let answer = `📄 **Employees Found (${employees.length}):**\n\n`;

        employees.forEach((employee, index) => {
          answer += `**${index + 1}. ${employee.firstName} ${
            employee.lastName
          }**\n`;
          answer += `👤 **Name:** ${employee.firstName} ${employee.lastName}\n`;
          answer += `📧 **Email:** ${employee.email}\n`;
          answer += `📞 **Phone:** ${employee.phone || "Not provided"}\n`;
          answer += `🏢 **Department:** ${
            employee.department || "Not assigned"
          }\n`;
          answer += `💰 **Salary:** ${
            employee.salary ? `$${employee.salary}` : "Not set"
          }\n`;
          answer += `⏰ **Working Hours:** ${
            employee.workingHours || "Not set"
          }\n`;
          if (employee.status === "deleted") {
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
            employeeData: employees,
          },
        };
      } else {
        // No employees found, provide simple HR guidance
        console.log("No employees found, providing HR guidance");
        return {
          success: true,
          message: "No employees found",
          data: {
            question,
            answer: `😕 **Oops! I couldn't find anyone named "${employeeName}" in your team.**

No worries though! Here's how to add someone new:

**📝 Adding a New Team Member:**
1. Go to **Employees** in the main menu
2. Click **"Add Employee"** 
3. Fill in their details
4. Click **"Save"**

**That's it!** Your new team member will be in the system! 🎉

**💡 Tip:** Make sure you have the correct spelling of the name. Sometimes names can be tricky! 😊`,
            timestamp: new Date().toISOString(),
          },
        };
      }
    }

    // For all other questions, send to backend chatbot API
    const response = await api.post("/chatbot", { question });
    const answer =
      response.data?.answer ||
      response.data?.data?.answer ||
      response.data?.data ||
      response.data;
    return {
      success: true,
      message: "AI chatbot response",
      data: {
        question,
        answer,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Chatbot service error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config,
    });

    // Provide helpful response instead of throwing error
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    console.error("Backend error message:", errorMessage);

    // Return helpful response instead of throwing error
    return {
      success: true,
      message: "Helpful guidance provided",
      data: {
        question,
        answer: `👋 **Hi there! I'm your friendly HR assistant!**\n\nOops! It seems I got a bit confused with your request. No worries though! 😊\n\nTry asking your question in a different way, or pick one of the quick questions above! I'm here to make your HR life easier! ✨`,
        timestamp: new Date().toISOString(),
      },
    };
  }
};

export default askChatBot;
