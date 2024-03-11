export function copyToClipboard(toCopy: string, message: string = "Copied to clipboard") {
  const input = document.createElement("input");
  input.setAttribute("value", toCopy);
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
  toast.success(message);
}
