// joins class names and skips empty values
const cn = (...parts) => parts.filter(Boolean).join(" ");

export default cn;
