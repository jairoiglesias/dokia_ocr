
module.exports = function(app) {

  var multer  = require('multer')
  var AWS = require('aws-sdk')
  var fs = require('fs')

  var upload = multer({ dest: 'uploads/' })

  // Configura AWS S3
  var bucketName = 'dokia'
  var AWSAccessKeyId = 'AKIAJQEDL6PJ7PWTI5HA'
  var AWSSecretKey = '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'

  // Valida a sessão no S3
  var s3 = new AWS.S3({
    accessKeyId: AWSAccessKeyId,
    secretAccessKey: AWSSecretKey,
    region: 'sa-east-1'
  })

  // Upload file usando o serviço do S3 da AWS
  function uploadAWS_S3(s3, params, callback){

    s3.putObject(params, function(err, data){

      if(err){
        console.log(err)
        callback(err)
      }
      else{

        console.log('Upload na Amazon S3 processado com sucesso!')
        callback(data)

      }
        
    })

  }

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

    req.setTimeout(0)

    console.log(res.body)
    console.log(req.files[0])

    var originalname = req.files[0].originalname
    var originalnameRaw = originalname.split('.')[0]

    var file = req.files[0].path

    var newFileNameImage = './uploads/'+originalnameRaw+'/'+originalname

    var newFolderName = './uploads/'+originalnameRaw

    // Cria o diretorio para guardar o PDF
    fs.mkdir(newFolderName, function(err){
      
      if(err.code == 'EEXIST'){
        console.log(err)
      }
      else{
        console.log('dir created')
      }
      
      // Renomeia o arquivo para o novo diretorio
      fs.rename(file, newFileNameImage, function (err) {
        
        if (err) throw err;
        
        console.log('renamed complete');

        var name = req.files[0].originalname
        name = name.replace('pdf', 'txt')

        // console.log(req.files)
        
        // ### Inicia o procedimento de conversão do PDF para formato de imagem ###

        var m_pdf2img = require('./../ajax/pdf2img.js')

        console.log('Iniciando a conversão do PDF para imagens')

        m_pdf2img.convertPdf2Img(newFileNameImage, function(result){

        
          function processaOCRLote(result, index, callback){

            // ### Inicia o procedimento de analise OCR ###

            var ocr = require('./../ajax/test_tesseract.js')

            // console.log(result.message[index])
            
            var imagePath = result.message[index].path

            console.log('Iniciando OCR Tesseract da imagem ' + imagePath)

            ocr.extractSingleImage(imagePath, function(ocrData){

              console.log(ocrData)

              var newFileNameText = './uploads/'+originalnameRaw+'/'+originalnameRaw+'.txt'

              fs.writeFile(newFileNameText, ocrData, function(err){

                if(err) throw err

                console.log('Extração de dados da imagem realizada com sucesso')
                console.log(index)

                if(index == (result.message.length - 1)){
                  callback()
                }
                else{
                  var newIndex = index + 1
                  processaOCRLote(result, newIndex, callback)
                }

              })
              
            })


          }

          processaOCRLote(result, 0, function(){

            console.log('Processamento de OCR finalizado')
            res.send('Finalizado com sucesso')

          })

        })

      })

    })
    
    
  })

  app.get('/get_upload_doc/:fileName', (req, res) => {

    var fileName = req.params.fileName

    var params = {
        Bucket: bucketName,
        Key: fileName
    }

    s3.getObject(params, function(err, data) {
      
      if(err){
        console.log(err, err.stack)
      }
      else{

        console.log(data);
        console.log(data.Body.toString());

        res.send(data.Body.toString())
      
    }
    
    })

  })

  app.get('/get_all_files', (req, res) => {

    var AllFiles = []
    var files = fs.readdirSync('./uploads/')

    var ip = require('ip').address()

    console.log(files.length)

    for(var i in files) {
      
      var subFiles = fs.readdirSync('./uploads/' + files[i])

      for(var j in subFiles){
        if(subFiles[j].indexOf('txt') != -1){

        }
        AllFiles.push('http://' + ip + ':3001/uploads/' + files[i] + '/' + subFiles[j])
      }

    }

    res.send(AllFiles)

  })

  app.get('/uploads/:dir/:file', (req, res) => {

    var dir = req.params.dir
    var file = req.params.file


    // res.download(req.path)
    console.log(req.path)
    console.log(dir, file)

  })

  app.get('/test_pdf2pic', (req, res) => {

    var m_pdf2pic = require('./../ajax/pdf2img.js')

    m_pdf2pic.convertPdf2Img(function(result){
      res.send(result)
    })

  })

}