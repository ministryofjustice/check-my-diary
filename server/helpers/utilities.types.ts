import type { Application } from 'express'

export interface Details {
  displayTypeTime?: string
  displayType?: string
  finishDuration?: number | null
  activity?: string
  start?: string
  end?: string
  parentType?: string
  lineLeftText?: string
  lineRightText?: string
}

export interface CalendarDay {
  activity?: string
  date?: string
  fullDayType?: string
  fullDayTypeDescription?: string
  details: Details[]
  dateText?: string
  dateDayText?: string
}

export interface AppRequest {
  app: Application
  authUrl: string
  params: { date: string }
  user: { token: string; employeeName: string; username: string }
  hmppsAuthMFAUser: boolean
}
