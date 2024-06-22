import * as sdk from 'botpress/sdk'

const onServerStarted = async (bp: typeof sdk) => {}
const onServerReady = async (bp: typeof sdk) => {}

const botTemplates: sdk.BotTemplate[] = [{ id: 'weatherbot', name: 'Bot thông tin thời tiết', desc: 'Cung cấp thông tin thời tiết của một thành phố' }]

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  botTemplates,
  definition: {
    name: 'examples',
    noInterface: true,
    menuText: 'Examples',
    fullName: 'Examples',
    homepage: 'https://botpress.com'
  }
}

export default entryPoint
