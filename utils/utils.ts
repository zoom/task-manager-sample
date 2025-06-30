import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export const formatDate = (date: Date) => {
  // Check if the date is a valid Date object

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Get the month, day, and year
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

export function dateFormatter(dateString: string | number | Date) {
  const inputDate = new Date(dateString);

  console.log("Input Date: ", inputDate);

  // Check if the date is valid
  if (isNaN(inputDate.getTime())) {
    return "Invalid Date";
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export const PRIORITYSTYLES = {
  high: "text-red-600",
  medium: "text-yellow-600",
  low: "text-blue-600",
};

export const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];