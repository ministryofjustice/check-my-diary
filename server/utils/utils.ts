import moment from 'moment'

export function initialiseName(fullName: string): string | null {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export function getRelativeModifiedDate(modifiedDate: string): string {
  return moment(modifiedDate).fromNow()
}
