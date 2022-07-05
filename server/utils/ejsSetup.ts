import express from 'express'
import * as pathModule from 'path'

export default function ejsSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('views', path.join(__dirname, '../views'))
  app.set('view engine', 'ejs')
}
