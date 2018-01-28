# private-props  
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/yakovmeister/private-props/tree/dev)
Simulation of private property for javascript (though private property isn't that needed in javascript), this module would probably be useless.
  
## Installation  
  
```
npm install -S private-props
```

## Usage  
  
```javascript
// sample usage on how to use this module
let props = require('private-props')

class Foo {
    constructor() {
        /** now this properties won't be accessible to the outside world */
        props(this).width = 100
        props(this).height = 100
        /** this is publicized properties */
        this.weight = 50
    }

    // accessing property from within class
    getWidth() {
        return props(this).width
    }
}

module.exports = Foo
```  
  
## Issues  
  
- somehow the content of the class is visible if you supply an instantiated version of the class