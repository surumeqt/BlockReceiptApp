export const getClerkErrorMessage = (err: any): string => {
  if (err?.errors && err.errors.length > 0) {
    const errorObj = err.errors[0];
    const { message, meta } = errorObj;
    const field = meta?.paramName ? meta.paramName.replace(/_/g, ' ') : null;

    // console.log('Clerk Error Raw:', message, field);

    const lowerCaseField = field ? field.toLowerCase() : '';
    const lowerCaseMessage = message.toLowerCase();
    
    if (lowerCaseMessage.includes('enter email address') || lowerCaseMessage.includes('is missing')) {
      return "Please enter your email address.";
    }
    if (lowerCaseMessage.includes('enter password')) {
      return "Please enter your password.";
    }
    if (lowerCaseField === 'email address' || lowerCaseField === 'identifier' || lowerCaseField === 'password') {
      if (lowerCaseMessage.includes('must be a valid email address') ||
          lowerCaseMessage.includes('is invalid')) {
        return "Please enter a valid email address (e.g., user@example.com).";
      }
      if (lowerCaseMessage.includes('taken')) return "Invalid email address.";
      if (lowerCaseMessage.includes('incorrect')) return "Password is too short."
    }

    if (lowerCaseMessage.includes('couldn\'t find your account') || lowerCaseMessage.includes('not found')) {
      return "Could not find an account with that email. Please check your credentials and try again.";
    }

    if (field) {
      const formattedField = field.charAt(0).toUpperCase() + field.slice(1);

      if (lowerCaseMessage.startsWith(formattedField.toLowerCase()) ||
          lowerCaseMessage.includes(formattedField.toLowerCase() + ' ')) {
          return message.charAt(0).toUpperCase() + message.slice(1);
      }
      return `${formattedField} ${message}`;
    }
    return message;
  }
  return "Something went wrong. Please try again.";
};