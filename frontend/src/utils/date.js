export const formatDateDDMMYYYY = (input) => {
  if (!input) return "N/A";
  try {
    const str = String(input);
    // Handle LocalDate (yyyy-mm-dd)
    const parts = str.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      const [yyyy, mm, dd] = parts;
      return `${dd.padStart(2, "0")}-${mm.padStart(2, "0")}-${yyyy}`;
    }
    // Fallback to Date parsing
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch {
    return String(input);
  }
};

export default {
  formatDateDDMMYYYY,
};
