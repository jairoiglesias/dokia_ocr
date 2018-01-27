
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

    console.log(req.files[0])

    var originalname = req.files[0].originalname
    var originalnameRaw = originalname.split('.')[0]

    var file = req.files[0].path

    var newFileNameImage = './uploads/'+originalnameRaw+'/'+originalname

    var newFolderName = './uploads/'+originalnameRaw

    fs.mkdir(newFolderName, function(err){
      if(err) throw err

      console.log('dir created')
      
      fs.rename(file, newFileNameImage, function (err) {
        
        if (err) throw err;
        
        console.log('renamed complete');

        var name = req.files[0].originalname
        name = name.replace('jpg', 'txt').replace('jpeg', 'txt').replace('tiff', 'txt')

        // console.log(req.files)

        var ocr = require('./../ajax/test_tesseract.js')

        console.log('Iniciando OCR Tesseract ...')

        ocr.extractSingleImage(newFileNameImage, function(result){

          console.log(result)

          var newFileNameText = './uploads/'+originalnameRaw+'/'+originalnameRaw+'.txt'

          fs.writeFile(newFileNameText, result, function(err){

            if(err) throw err

            console.log('Upload na Amazon S3 processado com sucesso!')
            res.send(result)

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
    
    var params = {
        Bucket: bucketName
    }

    s3.listObjects(params, function(err, data){
      var bucketContents = data.Contents;

      var fileUrls = []
        
        for (var i = 0; i < bucketContents.length; i++){

          var urlParams = {Bucket: 'dokia', Key: bucketContents[i].Key};
          
          s3.getSignedUrl('getObject', urlParams, function(err, url){
            
            console.log('the url of the image is', url);

            var fileName = url.split('/')[3].split('?')[0]

            fileUrls.push({
              fileName: fileName,
              url: url
            })
            
            if(fileUrls.length == (bucketContents.length - 1)){
              res.send(fileUrls)
            }

          })

        }
    })

  })

}