export const cleanString = (str: string) => {
  return str
    .replace(/[\t\r\n]/g, '') // Remove tabs, line breaks
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim()
}
