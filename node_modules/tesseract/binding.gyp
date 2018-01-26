{
  'targets': [
    {
      # have to specify 'liblib' here since gyp will remove the first one :\
      'target_name': 'tesseract_bindings',
      'sources': [
        'src/tesseract_bindings.cc',
        'src/tesseract_baseapi.cc',
        'src/leptonica_pix.cc'
      ],
      'conditions': [
        ['OS=="win"', {
          # no Windows support yet...
        }, {
          'libraries': [
            '-llept', '-ltesseract'
          ],
          'include_dirs': [
            '/usr/include/leptonica', 
            '/usr/include/tesseract',
            '/usr/local/include/leptonica',
            '/usr/local/include/tesseract',
            # OS X: change your versions here if needed
            '/usr/local/Cellar/tesseract/3.02.02_3/include/tesseract',
            '/usr/local/Cellar/leptonica/1.71_1/include/leptonica'
          ]
        }]
      ]
    }
  ]
}