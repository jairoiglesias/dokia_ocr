pdftojpg
========

### A [NodeJS](http://nodejs.org) module for converting a PDF file to a JPG file.

This module does one thing, and one thing only.  It converts a PDF file to a JPG file.
It shold be used on single-page PDFs, but should you try to convert a multi-page PDF, only the first page will be converted.

## Author
  - Werner Vesterås <wvesteraas@gmail.com>

## Installation

To be able to use this module, the `ghostscript` tool must be installed.  On my Ubuntu machine, I installed it by typing:

```bash
$ sudo apt-get install ghostscript
```

Finally, you can install the `pdftojpg` module itself, by typing:

```bash
$ npm install pdftojpg
```

## Examples

The file `test.js` demonstrates this module in action.
