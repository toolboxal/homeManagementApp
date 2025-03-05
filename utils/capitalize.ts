export const capitalize = (text: string) => {
  const splitArr = text.split('_')
  const formatted = splitArr.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  )
  return formatted.join(' ')
}
