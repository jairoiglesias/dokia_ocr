
// Função construtora que ira permitir o processamento dos textos

var speechConstructEngine = function(){

  // Variaveis de escopo da função
  var lastFrameSeconds;
  var currentFrameSeconds;
  var minTick;
  var lastDomObj;
  var lastCssProp;

  lastFrameSeconds = new Date().getTime();
  minTick = 700;

  // Array de objetos que ira devolver o retorno HTML baseado em palavras chaves
  var keywordHTML = [
    {keyword: 'cabeçalho', html: '<div id="header">Cabeçalho</div>'},
    {keyword: 'menu', html: '<div id="menu">Menu</div>'},
    {keyword: 'rodapé', html: '<div id="rodape">Rodape</div>'},
    {keyword: 'form', html: '<form></form>'},
    // {keyword: 'template', html: '<iframe src="http://localhost:3001/templates/halice/index.html" id="iframe_bluehack" style="width:100%; height:90%"></iframe>'},
    // {keyword: 'template', html: '<iframe src="/template" id="iframe_bluehack" style="width:100%; height:90%"></iframe>'},
    // {keyword: 'template', html: '<iframe src="templates/Bluehack.html" id="iframe_bluehack" style="width:100%; height:90%"></iframe>'},
    // {keyword: 'template', html: '<frameset><frame src="templates/Bluehack.html" id="iframe_bluehack" style="width:100%; height:90%"></frameset>'},
  ]

  var keywordCSSProp = [
    {keyword: 'esquerda', cssProp: 'float'},
    {keyword: 'right', cssProp: 'float'},
    {keyword: 'espaço interno', cssProp: 'padding'},
    {keyword: 'margem', cssProp: 'margin'},
    {keyword: 'fundo', cssProp: 'background'},
    {keyword: 'com fundo', cssProp: 'background'},
    {keyword: 'cor de fundo', cssProp: 'background'},
    {keyword: 'cor do fundo', cssProp: 'background'},
    {keyword: 'alinhar', cssProp: 'float'},
    {keyword: 'alinhado', cssProp: 'float'},
    {keyword: 'alinhamento', cssProp: 'float'},
    {keyword: 'largura', cssProp: 'width'},
    {keyword: 'Largura', cssProp: 'width'},
    {keyword: 'altura', cssProp: 'height'},
  ]

  var keywordCSSValue = [
    {keyword: 'azul', cssValue: 'blue'},
    {keyword: 'vermelho', cssValue: 'red'},
    {keyword: 'amarelo', cssValue: 'yellow'},
    {keyword: 'cinza', cssValue: 'grey'},
    {keyword: 'verde', cssValue: 'green'},
    {keyword: 'branco', cssValue: 'white'},
    {keyword: '10', cssValue: '10px'},
    {keyword: '20', cssValue: '20px'},
    {keyword: '30', cssValue: '30px'},
    {keyword: '40', cssValue: '40px'},
    {keyword: '50', cssValue: '50px'},
    {keyword: '60', cssValue: '60px'},
    {keyword: '70', cssValue: '70px'},
    {keyword: 'esquerda', cssValue: 'left'},
    {keyword: 'direita', cssValue: 'right'},
  ]

  // Função para fazer parse do Text
  this.parseText = function(audioTranscritEvent, callback){

    currentFrameSeconds = new Date().getTime();

    // Passa para a funcao analisar o texto
    textToHTML(audioTranscritEvent, function(result){

      callback(result);

    });

  };

  // Gambi para apresentar o Pitch

  // function mocatedTemplate(){
  //
  //   var iframe = document.createElement('iframe');
  //   iframe.src = 'http://www.bluehack.org/';
  //
  //   $('#container').append(iframe);
  //
  // }

  function log(text){
    console.log('SpeechConstructEngine Log: ' + text);
  }

  // Função que ira aplicar analise no texto e devolver HTML
  function textToHTML(audioTranscritEvent, callback){

    var audioTranscritText = event.results[event.results.length - 1][0].transcript;

    // console.log(event);
    console.log(audioTranscritText);

    // Recupera a ultima palavra da sequencia de texto recuperada pelo Transcript
    var lastWord = audioTranscritText.split(" ");
    lastWord = lastWord[lastWord.length - 1];

    var html = '';

    // Fixa problema do Speech devolver varias vezes a mesma palavra de uma vez

    console.log(lastWord);

    var currentTick = currentFrameSeconds - lastFrameSeconds;

    if(currentTick < minTick){
      callback('');
      return;
    }

    console.log('Proxima palavra a ser processada: ' + lastWord);

    // Inicia o parse HTML
    keywordHTML.forEach(function(currentValue, index, array){

      // Verifica se ultima palavra capturada pelo Speech está no array de HTML
      if(currentValue.keyword.indexOf(lastWord) != -1){
      // if(currentValue.keyword == lastWord){

        var el =  $.parseHTML(currentValue.html);

        console.log(el);
        html = el;

        lastDomObj = el;

        // if(currentValue.keyword.indexOf('template') != -1){
        //
        //     setTimeout(function(){
        //
        //       var docFrame = document.getElementById('iframe_bluehack').contentDocument;
        //
        //       // var docFrame = docFrame.frames[0].contentDocument;
        //       // var menuLeft = $(docFrame).find('#nav-mobile-left');
        //       // console.log(menuLeft);
        //
        //       // console.log(docFrame.frames.length);
        //       console.log(docFrame);
        //
        //
        //
        //     }, 5000)
        //
        //
        // }

        return;

      }

    });

    // Inicia o parse da propriedade CSS
    keywordCSSProp.forEach(function(currentValue, index, array){

      // Verifica se ultima palavra capturada pelo Speech está no array de HTML
      if(currentValue.keyword.indexOf(lastWord) != -1){
      // if(currentValue.keyword == lastWord){

        var el = lastDomObj;

        lastCssProp = currentValue.cssProp.trim();

        console.log(lastCssProp);

        return;

      }

    });

    // Inicia o parse do valor CSS
    keywordCSSValue.forEach(function(currentValue, index, array){

      // Verifica se ultima palavra capturada pelo Speech está no array de HTML
      if(currentValue.keyword.indexOf(lastWord) != -1){
      // if(currentValue.keyword == lastWord){

        var el = lastDomObj;

        $(el).css(lastCssProp, currentValue.cssValue);

        return;

      }

    });

    // lastWordRecognized = lastWord;                // Armazena a ultima palavra coletada
    lastFrameSeconds = new Date().getTime();      // Armazena o ultimo tick

    // Invoca callback devolvendo o HTML resultante do Parser
    callback(html);
    return;

  }

}
