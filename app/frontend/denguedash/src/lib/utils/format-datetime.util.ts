export const formatDateTime = (input: string) => {
  // Expected input format: "YYYY-MM-DD-HH-MM-SS"
  const [year, month, day, hour, minute, second] = input.split("-");
  // Create a Date (month is zero-indexed)
  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10)
  );

  // Define formatting options
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  };

  // Format the date and remove the extra comma, if any
  return date.toLocaleString("en-US", options).replace(",", "");
};

export const formatDate = (input: string) => {
  // Expected input format: "YYYY-MM-DD"
  // Expected output format: "Month DD, YYYY"
  const [year, month, day] = input.split("-");
  // Create a Date (month is zero-indexed)
  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10)
  );

  // Define formatting options
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Format the date and remove the extra comma, if any
  return date.toLocaleString("en-US", options).replace(",", "");
};
