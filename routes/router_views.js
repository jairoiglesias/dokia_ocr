
module.exports = function(app) {

  app.get('/', (req, res) => {
    res.send('Tesseract NodeJs Started !!!')
  })

  app.get('/upload_doc', (req, res) => {
    res.render('upload_doc')
  })

  app.get('/testa_tesseract', (req, res) => {

    // var ocr = require('./../ajax/test_tesseract.js')

    var tesseract = require('node-tesseract');
    console.log(tesseract)

  })

}