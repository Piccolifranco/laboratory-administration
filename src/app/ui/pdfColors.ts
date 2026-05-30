// react-pdf cannot read CSS variables (it does not render to the DOM),
// so PDF colors live here as plain hex constants.
export const pdfColors = {
  border: "#000000",
  text: "#000000",
} as const;