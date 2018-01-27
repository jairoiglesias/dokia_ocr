
module.exports = function(app) {

  var multer  = require('multer')
  var upload = multer({ dest: 'uploads/' })

  app.get('/', (req, res) => {
    res.send('Tesseract NodeJs Started !!!')
  })

  app.get('/upload_doc', (req, res) => {
    res.render('upload_doc')
  })

  app.get('/testa_tesseract', (req, res) => {

    var ocr = require('./../ajax/test_tesseract.js')

    var imageFullPath = 'public/images_ocr/avaliaca_judicial_02.tiff'
    
    ocr.extractSingleImage(imageFullPath, function(result){
        
        console.log(result)
        res.send(result)
        
    })

  })

  app.post('/upload_doc', upload.any(), (req, res) => {

    var file = req.files[0].path

    // console.log(file)

    var ocr = require('./../ajax/test_tesseract.js')

    ocr.extractSingleImage(file, function(result){
      
      console.log(result)
      res.send(result)
      
    })
    

  })

}