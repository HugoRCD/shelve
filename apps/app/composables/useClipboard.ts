export function copyToClipboard(toCopy: string, message: string = "Copied to clipboard") {
  navigator.clipboard.writeText(toCopy).then(() => {
    toast.success(message);
  });
}
