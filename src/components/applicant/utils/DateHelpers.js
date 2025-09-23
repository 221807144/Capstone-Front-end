// utils/dateHelpers.js
export const calculateExpiryDate = (vehicleYear) => {
  const issueDate = new Date();
  const dateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (!isNaN(vehicleYear) && vehicleYear >= 2024) {
    // Vehicles 2024 or newer expire in 1 year
    const temp = new Date(issueDate);
    temp.setFullYear(temp.getFullYear() + 1);
    return dateOnly(temp);
  }

  // Older vehicles or unknown year: expire today
  return dateOnly(issueDate);
};
