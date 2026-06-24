export const formatDateDDMMYYYY = (input) => {
  if (!input) return "N/A";
  try {
    const str = String(input);
    // Preserve the calendar date supplied by LocalDate/LocalDateTime APIs.
    const isoDate = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      const [, yyyy, mm, dd] = isoDate;
      return `${dd}/${mm}/${yyyy}`;
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(input);
  }
};

export const formatDateTimeDDMMYYYY = (input) => {
  if (!input) return "N/A";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return formatDateDDMMYYYY(input);

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatDateDDMMYYYY(input)}, ${time}`;
};

export default {
  formatDateDDMMYYYY,
  formatDateTimeDDMMYYYY,
};
