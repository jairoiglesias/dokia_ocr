
var fileNameUpload = ''
var dadosCatossinho = ''
var dadosNLU = []
var dadosAnalise = []

module.exports = function(app) {

  var multer = require('multer')
  var fs = require('fs')
  var rp = require('request-promise').defaults({simple : false})
  var proc = require('child_process')

  var upload = multer({ dest: 'uploads/' })

  app.get('/teste', (req, res) => {
    res.send('teste realizado com sucesso!')
  })

  app.get('/', (req, res) => {
    res.send('Tesseract NodeJs Started !!!')
  })

  app.get('/upload_doc', (req, res) => {
    res.render('upload_doc')
  })

  app.get('/analise', (req, res) => {
    res.render('analise')
  })

  app.get('/analise_v2', (req, res) => {
    res.render('analise_v2')
  })

  app.get('/get_image/:imagem', (req, res) => {
    
    var imagem = req.params.imagem

    var imagemPath = './ajax/output/'+imagem

    res.set('Content-Type', 'image/png')

    fs.readFile(imagemPath, function(err, data) {

      if(err) throw err
      
      res.send(data)
      
    })


  })

  app.get('/lista_imagens', (req, res) => {

    fs.readdir('./ajax/output', (err, items) => {
      res.send(items)

    })

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

    dadosNLU = []
    dadosAnalise = []

    console.log('### Request Front Catossi ###')
    console.log('variavel docSend:')
    console.log(req.body.docSend)
    console.log('==============================')
    console.log('Arquivos de PDF via Upload:')
    console.log(req.files)
    console.log('==============================')

    dadosCatossinho = req.body.docSend

    // Cria objeto JSON que sera usado para envio de requisicao
    var reqWKS = {
      ocr: []
    }

    var originalname = req.files[0].originalname
    var originalnameRaw = originalname.split('.')[0]

    fileNameUpload = originalnameRaw
    
    var file = req.files[0].path

    var newFileNameImage = './uploads/'+originalnameRaw+'/'+originalname

    var newFolderName = './uploads/'+originalnameRaw

    // Cria o diretorio para guardar o PDF
    fs.mkdir(newFolderName, function(err){
      
      if(err){
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
        
        // ### Inicia o procedimento de conversão do PDF para formato de imagem ###

        var m_pdf2img = require('./../ajax/pdf2img.js')

        console.log('Iniciando a conversão do PDF para imagens')

        m_pdf2img.convertPdf2Img(newFileNameImage, function(result){

          function processaOCRLote(result, index, reqWKS, callback){

            // ### Inicia o procedimento de analise OCR ###

            var ocr = require('./../ajax/test_tesseract.js')

            // console.log(result.message[index])
            
            var imagePath = result.message[index].path

            console.log('Iniciando OCR Tesseract da imagem ' + imagePath)

            ocr.extractSingleImage(imagePath, function(ocrData){

              console.log(ocrData)

              var newFileNameText = './uploads/'+originalnameRaw+'/'+originalnameRaw+'_' + (index + 1) + '.txt'

              // ocrData = ocrData.replace(String.fromCharCode(10), '').replace(String.fromCharCode(13), '')
              ocrData = ocrData.replace(/(\r\n|\n|\r)/gm," ");
              ocrData = ocrData.replace(/\s+/g," ");

              fs.writeFile(newFileNameText, ocrData, function(err){

                if(err) throw err

                console.log('Extração de dados da imagem realizada com sucesso')
                console.log(index)

                reqWKS.ocr.push(ocrData)

                if(index == (result.message.length - 1)){
                  callback()
                }
                else{
                  var newIndex = index + 1
                  processaOCRLote(result, newIndex, reqWKS, callback)
                }

              })
              
            })


          }

          // Efetua o processamento OCR das imagens
          processaOCRLote(result, 0, reqWKS, function(){

            console.log('Processamento de OCR finalizado')
            console.log('===============================================')

            if(reqWKS.ocr.length == 0){

              res.send('Finalizado com sucesso')

            }
            else{

              console.log('Enviando os dados de OCR para EndPoint do NLU/WKS para analise')

              reqWKS.ocr.forEach(function(ocrData, ocrIndex){

                var url = 'https://dokia-project.mybluemix.net/process'

                var requestOptions = {
                  method: 'POST',
                  resolveWithFullResponse: true,
                  uri: url,
                  json: true,
                  body: {
                    "texto": ocrData
                  }
                }

                rp(requestOptions).then(function(response){

                  console.log('OCR index: ' + ocrIndex + ' => Requisicao a EndPoint enviado com sucesso!')
                  
                  if(ocrIndex == (reqWKS.ocr.length - 1)){

                    res.send('Finalizado com sucesso')

                  }

                }).catch(function(err){

                  console.log('Erro EndPoint Handled !')
                  console.log(err.error)

                  if(ocrIndex == (reqWKS.ocr.length - 1)){

                    res.send('Finalizado com sucesso')

                  }

                })

              })

            }

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

  // Callback invocado pelo NodeRed com os dados do NLU

  app.post('/callback_nlu', function(req, res){

    var msg = req.body

    dadosNLU.push(msg)

    console.log('URL de callback invocado pelo serviço NodeRed do NLU')
    console.log(msg)
    console.log('=====================================')
    console.log('Enviado dados para EndPoint do Python no Heroku')

    // Monta o JSON contendo os dados do Front + Processamento NLU
    var reg = {
      base: dadosCatossinho,
      doc: msg
    }

    var url = 'https://dokia-validation.herokuapp.com/'

    var requestOptions = {
      method: 'POST',
      resolveWithFullResponse: true,
      uri: url,
      json: true,
      body: reg
    }

    rp(requestOptions).then(function(response){

      var body = response.body

      dadosAnalise.push(body)

      console.log(body)
      res.send(body)

    })
    
  })

  app.get('/catossinho', (req, res) => {

    var resp = {
      fileNameUpload, dadosCatossinho, dadosNLU, dadosAnalise
    }

    res.send(resp)

  })

}