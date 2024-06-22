import * as sdk from 'botpress/sdk'

import vi from '../translations/vi.json'
import en from '../translations/en.json'
import es from '../translations/es.json'
import fr from '../translations/fr.json'

import api from './api'
import db from './db'

const onServerStarted = async (bp: typeof sdk) => {
  await db(bp).initialize()
}

const onServerReady = async (bp: typeof sdk) => {
  await api(bp, db(bp))
}

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  translations: { vi, en, fr, es },
  definition: {
    name: 'bot-improvement',
    menuIcon: 'thumbs-up',
    menuText: 'Bot Improvement',
    noInterface: false,
    experimental: true,
    fullName: 'Bot Improvement',
    homepage: 'https://botpress.io'
  }
}

export default entryPoint
