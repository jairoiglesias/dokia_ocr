
var rp = require('request-promise')
var cheerio = require('cherrio')

var loginUnity = function(email, senha){

  return new Promise(function(resolve, reject){

    var urlLoginPost = 'https://id.unity.com/en/conversations/26dcb120-c70c-48a6-ae07-c2e13aba96f8002f'

    var formLoginPost = {}
    formLoginPost['utf8'] = '✓'
    formLoginPost['_method'] = 'put'
    formLoginPost['authenticity_token'] = 'JGVCi9W26cY8St6Gx9efJdm0iHneLsF1ujMirI/aerip15HwqxlkZZuVycGNB/VKqpOiMVjWTwIUxP1Pr+IISA=='
    formLoginPost['conversations_create_session_form[email]'] = email
    formLoginPost['conversations_create_session_form[password]'] = senha
    formLoginPost['conversations_create_session_form[remember_me]'] = 'false'
    formLoginPost['commit'] = 'Sign in'

    var requestOptions = {
      resolveWithFullResponse: true,
      method: 'POST',
      uri: urlLoginPost,
      form: formLoginPost,
      headers: {
          /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
      }
    }

    console.log('Efetuando validação de Login no Unity Connect')

    rp(requestOptions).then(function(response){


      console.log('Login validado com sucesso')

    })

  })

}

var email = 'jairohighwind@hotmail.com'
var senha = 'Wizard360210291189'

loginUnity(email, senha).then(function(){

})
