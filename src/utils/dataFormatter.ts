/**
 * Capitalizes the first letter of a sentence and converts the rest to lowercase.
 * 
 * @param str - The input string to capitalize.
 * @returns A string with the first letter capitalized and the rest in lowercase.
 */
export const capitalizeSentence = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formats a date string into a readable format (e.g., "Oct 12, 2023, 3:45 PM").
 * 
 * @param dateString - The input date string.
 * @returns A formatted date string in "MMM DD, YYYY, hh:mm AM/PM" format.
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    };
    return date.toLocaleString("en-US", options);
};
