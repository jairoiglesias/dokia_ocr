
var tesseract = require('node-tesseract');

var options = {
	l: 'por',
};

var image = 'file.tiff'

console.log('Iniciando extração de dados usando Tesseract')
console.log(image)

tesseract.process(image, function(err, text) {
	if(err) {
		console.error(err);
        console.log('Erro ao tentar ler arquivo no Tesseract')
	} else {
		console.log(text);
	}
})


