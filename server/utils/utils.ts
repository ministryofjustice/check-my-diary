import { formatDistanceToNowStrict } from 'date-fns'

export function initialiseName(fullName: string): string | null {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export function getRelativeModifiedDate(modifiedDate: string): string {
  return formatDistanceToNowStrict(new Date(modifiedDate), { addSuffix: true })
}
