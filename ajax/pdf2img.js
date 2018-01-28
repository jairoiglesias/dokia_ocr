
// TESTE 01

let PDF2Pic = require('pdf2pic')
let converter = new PDF2Pic({
    density: 500,               // output pixels per inch
    savename: "teste",          // output file name
    savedir: "./ajax/",         // output file location
    format: "png",              // output file format
    size: 2000                  // output size in pixels
})

function convertPdf2Img(callback){
    
    // fuck it, we can also convert all pages to pdf by
    // supplying -1 as second argument

    converter.convertBulk("./ajax/test.pdf", -1).then(resolve => {
        
        console.log("image converted successfully")
        callback(resolve)

    })
}

// convertPdf2Img(function(resolve){

//     console.log(resolve)

// })

module.exports = {
    convertPdf2Img
}

// teste 02

// var pdf2image = require('pdf2image');
 
// //converts all the pages of the given pdf using the default options  
// pdf2image.convertPDF('./ajax/test.pdf').then(
//     function(pageList){
//         console.log(pageList);
//     }
// ).catch(function(err){
//     console.log(err)
// })

// teste 03

// var PDFImage = require("pdf-image").PDFImage;

// var pdfImage = new PDFImage("test.pdf");
// console.log(pdfImage)
// pdfImage.convertPage(0).then(function (imagePath) {
//   // 0-th page (first page) of the slide.pdf is available as slide-0.png
// //   fs.existsSync("/tmp/slide-0.png") // => true
//     console.log('teste')
//     console.log(imagePath)
// });