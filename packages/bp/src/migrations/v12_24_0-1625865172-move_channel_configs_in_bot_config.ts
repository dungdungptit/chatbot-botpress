import * as sdk from 'botpress/sdk'
import { Migration, MigrationOpts } from 'core/migration'

const ROOT_FOLDER = './config'
const CHANNELS = ['messenger', 'slack', 'smooch', 'teams', 'telegram', 'twilio', 'vonage'] as const

type Channels = typeof CHANNELS[number]

const migration: Migration = {
  info: {
    description: 'Di chuyển cấu hình kênh vào cấu hình bot',
    target: 'bot',
    type: 'config'
  },
  up: async ({ bp, metadata, configProvider }: MigrationOpts): Promise<sdk.MigrationResult> => {
    const channels: { [channelName: string]: boolean } = {}
    const config = await configProvider.getBotpressConfig()
    for (const module of config.modules) {
      const { location, enabled } = module

      const channelName = location.replace('MODULES_ROOT/channel-', '')
      if (location.includes('channel-') && CHANNELS.includes(channelName as Channels)) {
        channels[channelName] = enabled
      }
    }

    const prepareBotConfig = (botConfig: sdk.BotConfig) => {
      if (!botConfig.messaging) {
        botConfig.messaging = { channels: {} } as sdk.MessagingConfig
      }

      if (!botConfig.messaging!.channels) {
        botConfig.messaging!.channels = {}
      }
    }

    const updateBotChannelConfig = async (botId: string, botConfig: sdk.BotConfig) => {
      if (Object.keys(botConfig.messaging?.channels || {}).length) {
        bp.logger.warn(`Bỏ qua quá trình chuyển giao cho bot ${botId}. Cấu hình bot đã chứa thông tin được chuyển giao.`)
        return
      }

      prepareBotConfig(botConfig)

      const ghost = bp.ghost.forBot(botId)
      const channelConfigsFilePath = await ghost.directoryListing(ROOT_FOLDER, 'channel-*.json')
      for (const file of channelConfigsFilePath) {
        const channelName = file.replace('.json', '').replace('channel-', '')
        if (!CHANNELS.includes(channelName as Channels)) {
          continue
        }

        let config = await ghost.readFileAsObject<any>(ROOT_FOLDER, file)

        // Disable channel if module was disabled
        if (channels[channelName] === false) {
          config.enabled = false
        }

        // Merge channel-messenger's global config (if it exists) with bot one.
        if (channelName === 'messenger') {
          try {
            const globalConfig = await bp.ghost.forGlobal().readFileAsObject<any>(ROOT_FOLDER, file)
            await bp.ghost.forGlobal().deleteFile(ROOT_FOLDER, file)

            config = Object.assign(globalConfig, config)
          } catch {
            bp.logger.warn(
              'Thiếu cấu hình chung cho channel-messenger. Bạn sẽ cần thêm appSecret và verifyToken theo cách thủ công vào cấu hình bot của mình.'
            )
          }
        }

        delete config['$schema']
        botConfig.messaging!.channels[channelName] = config
        await ghost.deleteFile(ROOT_FOLDER, file)
      }

      await configProvider.setBotConfig(botId, botConfig)
    }

    if (metadata.botId) {
      const botConfig = await bp.bots.getBotById(metadata.botId)
      await updateBotChannelConfig(metadata.botId, botConfig!)
    } else {
      const bots = await bp.bots.getAllBots()
      for (const [botId, botConfig] of bots) {
        await updateBotChannelConfig(botId, botConfig)
      }
    }

    return { success: true, message: 'Đã cập nhật cấu hình thành công' }
  },
  down: async ({ bp, metadata, configProvider }: MigrationOpts) => {
    const generateChannelConfig = async (botId: string, botConfig: sdk.BotConfig) => {
      if (Object.keys(botConfig.messaging?.channels || {}).length === 0) {
        bp.logger.warn(`Bỏ qua quá trình chuyển giao cho bot ${botId}. Cấu hình bot không chứa bất kỳ thông tin kênh nào.`)
        return
      }

      const channels = botConfig.messaging!.channels
      const ghost = bp.ghost.forBot(botId)
      for (const channel of Object.keys(channels) as Channels[]) {
        const file = `channel-${channel}.json`
        const config = channels[channel]

        // Generate channel-messenger's global config from bot config.
        if (channel === 'messenger') {
          const warning = () =>
            bp.logger.warn(
              'Không thể lưu cấu hình chung cho channel-messenger. Bạn sẽ cần thêm appSecret và verifyToken vào cấu hình chung của mình theo cách thủ công.'
            )
          try {
            if (config.appSecret && config.verifyToken) {
              const globalConfig = { appSecret: config.appSecret, verifyToken: config.verifyToken }

              delete config.appSecret
              delete config.verifyToken

              await bp.ghost.forGlobal().upsertFile(ROOT_FOLDER, file, JSON.stringify(globalConfig, null, 2))
            } else {
              warning()
            }
          } catch {
            warning()
          }
        }

        await ghost.upsertFile(ROOT_FOLDER, file, JSON.stringify(config, null, 2))
      }

      delete botConfig.messaging
      await configProvider.setBotConfig(botId, botConfig)
    }

    if (metadata.botId) {
      const botConfig = await bp.bots.getBotById(metadata.botId)
      await generateChannelConfig(metadata.botId, botConfig!)
    } else {
      const bots = await bp.bots.getAllBots()
      for (const [botId, botConfig] of bots) {
        await generateChannelConfig(botId, botConfig)
      }
    }

    return { success: true, message: 'Đã cập nhật cấu hình thành công' }
  }
}

export default migration
