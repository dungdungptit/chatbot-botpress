import { lang } from 'botpress/shared'

import vi from './vi.json'
import en from './en.json'
import es from './es.json'
import fr from './fr.json'

const translations = { vi, en, fr, es }

const initializeTranslations = () => {
  lang.extend(translations)
  lang.init()
}

export { initializeTranslations }
