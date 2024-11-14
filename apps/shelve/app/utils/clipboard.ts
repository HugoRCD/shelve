export function copyToClipboard(toCopy: string, message: string = 'Copied to clipboard') {
  const lines = toCopy.split('\n').filter((line) => line.trim() !== '')
  const variables = lines.map((line) => {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=')
    return `${key}=${value}`
  })
  const formattedString = variables.join('\n')
  navigator.clipboard.writeText(formattedString).then(() => {
    toast.success(message)
  })
}
