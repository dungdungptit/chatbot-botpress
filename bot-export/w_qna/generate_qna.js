const { log } = require('console');
const fs = require('fs');

const uuid = () => {
  return 'xxxxxxxxxx'.replace(/[x]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const stringToSlug = (str) => {
  // remove accents
  let from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
    to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }
  str = str.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]/g, '_')
    .replace(/-+/g, '_');
  return str;
}

const generateQnA = (filePath) => {
  let res = {
    qnas: [],
    contentElements: [],
  }
  let res_code = {
    qnas: [],
    contentElements: [],
  }
  let jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const [key, value] of Object.entries(jsonData)) {
    console.log(`${key}.................`);
    // let intent_id = `${uuid()}_${stringToSlug(key)}`
    let intent_id = `${stringToSlug(key)}`
    let qna = {
      id: intent_id,
      data: {
        answers: {
          vi: ["Câu trả lời"]
        },
        questions: {
          vi: value.questions
        },
        redirectFlow: "",
        redirectNode: "",
        action: "text",
        enabled: true,
        contexts: [
          stringToSlug(key)
        ]
      },
    }
    let qna_code = {
      id: intent_id,
      name: key,
      data: {
        answers: {
          vi: value.answers.length > 0 ? value.answers : ["Câu trả lời"]
        },
        questions: {
          vi: value.questions
        },
        redirectFlow: "",
        redirectNode: "",
        action: "text",
        enabled: true,
        contexts: [
          stringToSlug(key)
        ]
      },
    }
    res.qnas.push(qna);
    res_code.qnas.push(qna_code);
  }
  return {
    res: res,
    res_code: res_code,
  };
}

let resData = generateQnA('./data_qna.json');

fs.writeFileSync('./w_ptit_qna.json', JSON.stringify(resData.res, null, 2), 'utf8');
fs.writeFileSync('./w_ptit_qna_code.json', JSON.stringify(resData.res_code, null, 2), 'utf8');
