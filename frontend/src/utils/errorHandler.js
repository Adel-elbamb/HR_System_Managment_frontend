/**
 * Utility function to handle backend validation errors
 * @param {Array} backendErrors - Array of error objects from backend
 * @returns {Object} - Object with field names as keys and user-friendly error messages as values
 */
export const handleBackendValidationErrors = (backendErrors) => {
  console.log("Error handler called with:", backendErrors);
  
  const errorsObj = {};
  
  if (!Array.isArray(backendErrors)) {
    console.log("Not an array, returning empty");
    return errorsObj;
  }

  backendErrors.forEach((error, index) => {
    console.log(`Processing error ${index}:`, error);
    
    if (error.path && error.path[0] && error.message) {
      const field = error.path[0];
      const message = error.message;
      const errorType = error.type || "";
      
      console.log(`Field: ${field}, Message: ${message}, Type: ${errorType}`);
      
      // Get field display name
      const getFieldDisplayName = (fieldName) => {
        const fieldMap = {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone Number",
          salary: "Salary",
          address: "Address",
          defaultCheckInTime: "Check-in Time",
          defaultCheckOutTime: "Check-out Time",
          gender: "Gender",
          nationality: "Nationality",
          nationalId: "National ID",
          birthdate: "Birthdate",
          department: "Department",
          weekendDays: "Weekend Days",
          overtimeValue: "Overtime Value",
          overtimeType: "Overtime Type",
          deductionValue: "Deduction Value",
          deductionType: "Deduction Type"
        };
        return fieldMap[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      };
      
      const fieldDisplayName = getFieldDisplayName(field);
      
      // Handle phone validation
      if (field === "phone") {
        if (errorType === "string.pattern.base" || message.includes("fails to match the required pattern")) {
          errorsObj[field] = `${fieldDisplayName} must be exactly 11 digits.`;
          console.log("Set phone error");
        } else if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle overtime value validation
      else if (field === "overtimeValue") {
        if (errorType === "number.base" || message.includes("must be a number")) {
          errorsObj[field] = `${fieldDisplayName} must be a valid number.`;
        } else if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle deduction value validation
      else if (field === "deductionValue") {
        if (errorType === "number.base" || message.includes("must be a number")) {
          errorsObj[field] = `${fieldDisplayName} must be a valid number.`;
        } else if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle salary validation
      else if (field === "salary") {
        if (errorType === "number.base" || message.includes("must be a number")) {
          errorsObj[field] = `${fieldDisplayName} must be a valid number.`;
        } else if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle email validation
      else if (field === "email") {
        if (message.includes("must be a valid email") || message.includes("invalid")) {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        } else if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("already exists") || message.includes("duplicate")) {
          errorsObj[field] = `This ${fieldDisplayName.toLowerCase()} is already registered.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle overtime type validation
      else if (field === "overtimeType") {
        if (message.includes("not allowed to be empty") || message.includes("must be one of")) {
          errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
        } else {
          errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle deduction type validation
      else if (field === "deductionType") {
        if (message.includes("not allowed to be empty") || message.includes("must be one of")) {
          errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
        } else {
          errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle first name validation
      else if (field === "firstName") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be a string")) {
          errorsObj[field] = `${fieldDisplayName} must be text only.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle last name validation
      else if (field === "lastName") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be a string")) {
          errorsObj[field] = `${fieldDisplayName} must be text only.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle address validation
      else if (field === "address") {
        if (message.includes("reapeated address") || message.includes("already exists")) {
          errorsObj[field] = `This ${fieldDisplayName.toLowerCase()} is already used by another employee.`;
        } else if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle check-in time validation
      else if (field === "defaultCheckInTime") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be a string")) {
          errorsObj[field] = `Please enter a valid time format (HH:MM) for ${fieldDisplayName.toLowerCase()}.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle check-out time validation
      else if (field === "defaultCheckOutTime") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be a string")) {
          errorsObj[field] = `Please enter a valid time format (HH:MM) for ${fieldDisplayName.toLowerCase()}.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle gender validation
      else if (field === "gender") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be one of")) {
          errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
        } else {
          errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle nationality validation
      else if (field === "nationality") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be a string")) {
          errorsObj[field] = `${fieldDisplayName} must be text only.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle national ID validation
      else if (field === "nationalId") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("already exists") || message.includes("duplicate")) {
          errorsObj[field] = `This ${fieldDisplayName} is already registered.`;
        } else if (message.includes("fails to match the required pattern")) {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName} format.`;
        } else {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName}.`;
        }
      }
      // Handle birthdate validation
      else if (field === "birthdate") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be a valid date")) {
          errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
        } else {
          errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle department validation
      else if (field === "department") {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
        } else if (message.includes("must be a valid")) {
          errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
        } else {
          errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Handle weekend days validation
      else if (field === "weekendDays") {
        if (message.includes("invalid")) {
          errorsObj[field] = `Please enter valid ${fieldDisplayName.toLowerCase()} (comma-separated).`;
        } else if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} are required.`;
        } else {
          errorsObj[field] = `Please enter valid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
      // Generic fallback for any other field
      else {
        if (message.includes("not allowed to be empty")) {
          errorsObj[field] = `${fieldDisplayName} is required.`;
        } else if (message.includes("must be a number")) {
          errorsObj[field] = `${fieldDisplayName} must be a valid number.`;
        } else if (message.includes("must be a string")) {
          errorsObj[field] = `${fieldDisplayName} must be text only.`;
        } else {
          errorsObj[field] = `Invalid ${fieldDisplayName.toLowerCase()}.`;
        }
      }
    }
  });

  console.log("Final errors object:", errorsObj);
  return errorsObj;
};

/**
 * Handle general backend errors (non-validation errors)
 * @param {Object} error - Error object from catch block
 * @returns {string} - User-friendly error message
 */
export const handleGeneralBackendError = (error) => {
  const backendError = error.response?.data;
  
  if (backendError?.message) {
    const message = backendError.message.toLowerCase();
    
    if (message.includes('reapeated address') || message.includes('already exists')) {
      return "This address is already used by another employee.";
    } else if (message.includes('duplicate') || message.includes('already registered')) {
      return "This information is already registered in the system.";
    } else if (message.includes('not found')) {
      return "The requested resource was not found.";
    } else if (message.includes('unauthorized') || message.includes('forbidden')) {
      return "You don't have permission to perform this action.";
    } else {
      return backendError.message;
    }
  }
  
  return "An error occurred. Please try again.";
}; 