try {
	module.exports = require('../build/Release/tesseract_bindings');
} catch(e) {
	module.exports = require('../build/Debug/tesseract_bindings');
}