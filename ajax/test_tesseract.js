
var tesseract = require('node-tesseract');
var fs = require('fs')

var options = {
	l: 'por',
};

var arg = process.argv.slice(2);

if(arg == '--extract-single-file'){
    
    var imageFullPath = 'images/' + arg
    
    extractSingleImage(imageFullPath, function(result){
        console.log(result)
    })

}
else if(arg == '--extract-all-files'){

    var folder = 'images'

    extractAllImages(folder, function(result){

    })
}


function extractSingleImage(imageFullPath, callback){

    tesseract.process(imageFullPath, function(err, text) {
        if(err) {
            console.error(err);
            console.log('Erro ao tentar ler arquivo no Tesseract')
            console.log(imageFullPath)
            callback(err)
        } else {
            console.log('Reconhecimento OCR concluído!')
            console.log(imageFullPath)
            callback(text)
        }
    })

}

function extractAllImages(folder, callback){

    fs.readdir(folder, (err, files) => {
    
        files.forEach(file => {
            
            if(file.indexOf('tiff') != -1 || file.indexOf('jpeg') != -1 || file.indexOf('jpg') != -1){
                
                var imageFullPath = 'images/' + file
                
                console.log('Iniciando a extração do arquivo ' + file)

                extractSingleImage(imageFullPath, function(result){

                    fs.writeFile('images/' + file + '.txt', result, function(err) {
                        if(err) throw err

                        console.log(file + ' => Extração realizada com sucesso!')
                    })
                })
            }

        })
    })
}

module.exports = {
    extractSingleImage,
    extractAllImages
}
