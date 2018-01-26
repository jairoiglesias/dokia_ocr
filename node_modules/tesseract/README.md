node-tesseract
==============

**Tesseract OCR bindings for Node.js.**

I started developing of this module when had a need to have Tesseract working with Node.js. But found that
existing modules do call `tesseract` command-line tool. And I have a need in fully customizable API. I started 
from [this article](simple-example-how-to-call-use-tesseract-library) and now working with Tesseract 3.02 API 
documentation. So soon will have much more things implemented! :wink:

Example
===============
```javascript
var tesseract = require("tesseract")
  , tess = new tesseract.BaseApi()
  , pix;

// set language
tess.init("eng");
// set image
tess.setImage("some-image.png");
// run recognition
tess.recognize();
// get recognized text
console.log(tess.getText());

// clear results
tess.clear();

// create Pix object (wrapper for Leptonica PIX structure)
pix = new tesseract.Pix("other-image.png");
// Pix can be used in BaseApi::SetImage() too
tess.setImage(pix);
// again recognize and get text
tess.recognize();
console.log(tess.getText());

// finish him! - free memory of underlying TessBaseAPI object
tess.end();
```


TODO
===============
* Make class BaseApi support more of TessBaseAPI
* Make tests
* Changelog
* Support of other Tesseract APIs (someday)!
