import { initialiseName, getRelativeModifiedDate } from './utils'

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('relative modified date', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2022-05-13T12:33:37').getTime())
  })
  it.each([
    ['1 second', '2022-05-13T12:33:36', 'a few seconds ago'],
    ['Seconds ago', '2022-05-13T12:33:30', 'a few seconds ago'],
    ['1 minute', '2022-05-13T12:32:37', 'a minute ago'],
    ['Minutes ago', '2022-05-13T12:20:37', '13 minutes ago'],
    ['1 hour', '2022-05-13T11:33:37', 'an hour ago'],
    ['Hours ago', '2022-05-13T04:33:37', '8 hours ago'],
    ['24 hours', '2022-05-12T12:33:37', 'a day ago'],
    ['Days ago', '2022-05-11T23:33:37', '2 days ago'],
    ['1 year', '2021-05-13T11:33:37', 'a year ago'],
    ['Years ago', '2020-04-13T11:33:37', '2 years ago'],
  ])('%s getRelativeModifiedDate(%s, %s)', (_: string, a: string, expected: string) => {
    expect(getRelativeModifiedDate(a)).toEqual(expected)
  })
})
