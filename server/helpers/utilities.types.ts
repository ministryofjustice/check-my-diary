import type { Application } from 'express'

export interface Details {
  displayTypeTime?: string
  displayType?: string
  finishDuration?: string | number | null
  activity: string
  activityDescription?: string
  start?: string
  end?: string
  parentType?: string
  lineLeftText?: string
  lineRightText?: string
  specialActivityColour?: string
  durationColour?: string
  showNightHr?: boolean
}

export interface CalendarDay {
  activity?: string
  date: string
  isFullDay?: boolean
  fullDayType: string
  fullDayTypeDescription?: string
  details: Details[]
  dateText?: string
  dateDayText?: string
  today?: boolean
}

export interface AppRequest {
  app: Application
  authUrl: string
  params: { date: string }
  user: { token: string; employeeName: string; username: string }
  hmppsAuthMFAUser: boolean
}
