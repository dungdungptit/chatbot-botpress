  // replace DEMO_KEY with your api key if you have one, or get a new one if you hit the limit of yours.
  const API_KEY = 'DEMO_KEY'

  // if there is an error with the api, this is most likely due to api limit hit, tell the user how to solve the problem
  const tellUserToGetApiKey = async () => {
    // general structure of a message
    const baseMessage = {
      type: 'text',
      markdown: false
    }
    // each message represents a speech bubble
    const messages = [
      { ...baseMessage, text: `Có vẻ như bạn đã đạt đến giới hạn api của NASA cho địa chỉ IP của mình! Để khắc phục điều này: ` },
      { ...baseMessage, text: `- Nhận khóa api miễn phí bằng biểu mẫu của họ trên https://api.nasa.gov/.` },
      { ...baseMessage, text: `- Vào Botpress Code Editor mở hành động get-rover-images.js.` },
      { ...baseMessage, text: `- Ở dòng thứ năm, Thay DEMO_KEY bằng khóa của bạn do NASA cung cấp.` }
    ]

    // Send the messages to the user
    await bp.events.replyToEvent(event, messages)
  }

  // import axios or any library here
  const axios = require('axios')

  // extract random image from nasa data
  const extractRandomImage = data => {
    if (data.photos.length === 0) {
      return null
    }
    data.photos.sort(() => Math.random() - 0.5) // quick shuffle of array for a bit of novelty
    return data.photos[0].img_src
  }

  const getFromNasa = async earthDate => {
    // if you are told to get an api key
    try {
      const getByDateUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?api_key=${API_KEY}&earth_date=${earthDate}`

      const { data } = await axios.get(getByDateUrl)
      return data
    } catch (e) {
      // this is probably due to an api limit
      await tellUserToGetApiKey()
    }
    return null
  }

  const getImagesForDate = async earthDate => {
    // let's use a basic caching mechanism to reduce api usage
    if (!session.nasaCache) {
      session.nasaCache = {}
    }
    if (session.nasaCache[earthDate]) {
      bp.logger.info('getting from cache')

      return session.nasaCache[earthDate]
    }
    const data = await getFromNasa(earthDate)
    session.nasaCache[earthDate] = data
    return data
  }

  /**
   * Fetches rover images from public Nasa api
   * @title Fetch Mars Rover Images
   * @category Nasa
   * @author Botpress
   * @param {string} earthDate - date on earth
   */
  const getRoverImages = async earthDate => {
    const formattedDate = new Date(earthDate).toISOString().split('T')[0]

    const data = await getImagesForDate(formattedDate)

    temp.roverImageUrl = extractRandomImage(data)
  }

  return getRoverImages(args.earthDate)
