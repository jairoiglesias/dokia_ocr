
module.exports = function(app) {

  var multer  = require('multer')
  var AWS = require('aws-sdk')

  var upload = multer({ dest: 'uploads/' })

  // Configura AWS S3
  var bucketName = 'dokia'
  var AWSAccessKeyId = 'AKIAJ2BCWKEYHUU4HEDA'
  var AWSSecretKey = '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'

  // Valida a sessão no S3
  var s3 = new AWS.S3({
    accessKeyId: AWSAccessKeyId,
    secretAccessKey: AWSSecretKey,
    region: 'sa-east-1'
  })

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
    
    var name = req.files[0].originalname
    name = name.replace('jpg', 'txt').replace('jpeg', 'txt').replace('tiff', 'txt')

    // console.log(req.files)

    var ocr = require('./../ajax/test_tesseract.js')

    ocr.extractSingleImage(file, function(result){

      /*
        Inicia o processo de envio pro S3 da Amazon
      */

      // Configura o upload

      var params = {
          Bucket: bucketName,
          Key: name,
          Body: result
      }

      console.log('Iniciando upload no Amazon S3 ...')
      
      s3.putObject(params, function(err, data){

        if(err) throw err;

        console.log('Upload na Amazon S3 processado com sucesso!')

        delete params.Body

        res.send(result)
        
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
            fileUrls.push(url)
            
            if(fileUrls.length == (bucketContents.length - 1)){
              res.send(fileUrls)
            }

          })

        }
    })

  })

}