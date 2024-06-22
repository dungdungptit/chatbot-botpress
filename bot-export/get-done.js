const fs = require('fs')

const getIntentUtterances = (botId, intent) => {
  console.log('-------------------------botId(getIntentUtterances): ', botId)
  let data = JSON.parse(fs.readFileSync(`./data/bots/${botId}/intents/${intent}.json`))
  return data
}

const getAnswer = (botId, intentId) => {
  console.log('-------------------------botId(getAnswer): ', botId)
  let data = JSON.parse(fs.readFileSync(`./data/bots/${botId}/custom-assets/w_ptit_qna_code.json`))
  let qnas = data.qnas
  console.log('-------------------------qnas(getAnswer): ', qnas)
  let res_qna = qnas.filter(qna => qna.id === intentId)[0]
  console.log('-------------------------res_qna(getAnswer): ', res_qna)
  return res_qna.data.answers.vi
}

/**
 * @title Reply user
 * @category Custom
 * @author tungsfer512
 */
const replyUser = async () => {
  let predictions = event.nlu.predictions
  let intents = []
  for (let [key, value] of Object.entries(predictions)) {
    console.log(`${key}.......`)
    if (typeof value === 'object' && value !== null) {
      let intents_te = value.intents
      if (!intents_te) {
        continue
      }
      let intents_x = intents_te.filter(intent_te => intent_te.confidence >= 0.3)
      intents = [...intents, ...intents_x]
    }
  }
  intents.sort((a, b) => b.confidence - a.confidence)

  console.log('-------------------------intents(main): ')
  console.log('-------------------------intents_length(main): ', intents.length)

  if (intents.length > 3) {
    intents = intents.slice(0, 3)
  }

  if (intents.length == 0) {
    console.log('-------------------------variables_0_check_true(main): ')
    event.state.user['none_message'] = true
  } else if (intents.length == 1) {
    event.state.user['none_message'] = false
    // console.log('-------------------------variables_1(main): ', await bp.kvs.forBot(event.botId).get('global'))
    const ans = getAnswer(event.botId, intents[0].label)
    const one_messages = ans.forEach(async item => {
      if (item['type'] == 'text') {
        const payloads = await bp.cms.renderElement(
          'builtin_text',
          {
            text: item['content']
          },
          event
        )
        await bp.events.replyToEvent(event, payloads)
      } else if (item['type'] == 'image') {
        const payloads = await bp.cms.renderElement(
          'builtin_image',
          {
            url: item['content']
          },
          event
        )
        await bp.events.replyToEvent(event, payloads)
      }
    })
    // await bp.events.replyToEvent(event, one_messages)
  } else if (intents.length == 2) {
    event.state.user['none_message'] = false
    // console.log('-------------------------variables_2(main): ', await bp.kvs.forBot(event.botId).get('global'))
    const intent_1 = getIntentUtterances(event.botId, intents[0].label).utterances.vi[0]
    const intent_2 = getIntentUtterances(event.botId, intents[1].label).utterances.vi[0]
    const payloads = await bp.cms.renderElement(
      'builtin_single-choice',
      {
        text: 'Hãy chọn câu hỏi mà bạn muốn hỏi',
        typing: false,
        choices: [
          {
            title: intent_1,
            value: intent_1
          },
          {
            title: intent_2,
            value: intent_2
          }
        ]
      },
      event
    )
    await bp.events.replyToEvent(event, payloads)
  } else if (intents.length == 3) {
    event.state.user['none_message'] = false
    // console.log('-------------------------variables_3(main): ', await bp.kvs.forBot(event.botId).get('global'))
    const intent_1 = getIntentUtterances(event.botId, intents[0].label).utterances.vi[0]
    const intent_2 = getIntentUtterances(event.botId, intents[1].label).utterances.vi[0]
    const intent_3 = getIntentUtterances(event.botId, intents[2].label).utterances.vi[0]
    const payloads = await bp.cms.renderElement(
      'builtin_single-choice',
      {
        text: 'Hãy chọn câu hỏi mà bạn muốn hỏi',
        typing: false,
        choices: [
          {
            title: intent_1,
            value: intent_1
          },
          {
            title: intent_2,
            value: intent_2
          },
          {
            title: intent_3,
            value: intent_3
          }
        ]
      },
      event
    )
    await bp.events.replyToEvent(event, payloads)
  }
}

return replyUser()
