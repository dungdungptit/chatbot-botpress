import * as sdk from 'botpress/sdk'

import vi from '../translations/vi.json'
import en from '../translations/en.json'
import es from '../translations/es.json'
import fr from '../translations/fr.json'

const botTemplates: sdk.BotTemplate[] = [
  { id: 'welcome-bot', name: 'Bot chào mừng', desc: "Bot cơ bản giới thiệu một số chức năng của Botpress" },
  { id: 'small-talk', name: 'Đoạn hội thoại nhỏ', desc: 'Một ví dự về một đoạn hội thoại nhỏ' },
  { id: 'empty-bot', name: 'Bot trống', desc: 'Bắt đầu với một luồng mới' },
  { id: 'learn-botpress', name: 'Học Botpress Cơ bản', desc: 'Học các tính năng cơ bản của Botpress' }
]

const entryPoint: sdk.ModuleEntryPoint = {
  botTemplates,
  translations: { vi, en, fr, es },
  definition: {
    name: 'builtin',
    menuIcon: 'fiber_smart_record',
    fullName: 'Botpress đã Xây dựng sẵn',
    homepage: 'https://botpress.com',
    noInterface: true
  }
}

export default entryPoint
