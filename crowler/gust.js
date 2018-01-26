

var rp = require('request-promise').defaults({ simple: false })
var cheerio = require('cheerio')
var conn = require('./../libs/connectdb.js')()

var getInvestorsGust = function(){

    conn.query('DELETE FROM tbl_organizations')
    conn.query("DELETE FROM tbl_preferred_sectors")

    var cookies = []

    return new Promise(function(resolve, reject){

        // Inicia a url de login para recuperar os cookies de sessão
        var url = 'https://gust.com/users/sign_in'

        var requestOptions = {
            uri : url,
            resolveWithFullResponse: true,
        }

        rp(requestOptions).then(function(response){

            console.log('Recuperando cookies iniciais')

            cookies.push(response.headers['set-cookie'][0].split(';')[0])
            cookies.push(response.headers['set-cookie'][1].split(';')[0])

            console.log('Recuperando cookies iniciais ...')
            console.log(cookies)
            console.log('=====================================')

            var login = 'jairohighwind@hotmail.com'
            var password = 'wizard10'

            // Recupera o token contido no input hidden
            var body = response.body
            var $ = cheerio.load(body)

            var authenticityToken = $('input[name="authenticity_token"]').val()

            var requestOptions = {
                method: 'POST',
                uri : url,
                resolveWithFullResponse: true,
                form : {
                    'utf8': '✓',
                    'authenticity_token': authenticityToken,
                    'user[email]': login,
                    'user[password]': password,
                    'user[remember_me]': '0',
                    'commit': 'Entrar'
                },
                headers:{
                    'Cookie' : cookies
                } 
            }

            rp(requestOptions).then(function(response){

                // Atualiza o array de cookies
                cookies.push(response.headers['set-cookie'][0].split(';')[0])
                cookies[1] = response.headers['set-cookie'][1].split(';')[0]

                console.log('Cookies finais recuperados e atualizados!')
                console.log(cookies)
                console.log('===================================')

                // Navega para a tela de pesquisa de organizacoes

                var url = 'https://gust.com/search/new?accepting_applications=true&category=investors'

                var requestOptions = {
                    uri : url,
                    resolveWithFullResponse: true,
                    headers: {
                        'Cookie' : cookies
                    }
                }

                rp(requestOptions).then(function(response){

                    // console.log(response.body)

                    var body = response.body
                    var $ = cheerio.load(body)

                    // Recupera o total de paginas
                    var totalPaginas = $('li.last').last().prev().text().trim()
                    var organizacoes = []

                    getListOrganizations(cookies, 1, totalPaginas, organizacoes, function(organizacoes){

                        console.log('Lista de organizacoes recuperada')
                        console.log(organizacoes)

                    })

                })

            })

        })

    })

}


var getListOrganizations = function(cookies, index, totalPaginas, organizacoes, callback){
    
    var url = 'https://gust.com/search/new?accepting_applications=true&category=investors&page='+index+'&partial=results'

    var requestOptions = {
        uri : url,
        resolveWithFullResponse: true,
        headers: {
            'Cookie' : cookies
        }
    }

    rp(requestOptions).then(function(response){

        var body = response.body
        var $ = cheerio.load(body)

        // Efetua o mapeamento de dados contidos na pagina
        var promise = new Promise(function(resolve, reject){

            var totalItems =  $('.list-group-item').length

            var organizacoesPagina = []

            $('.list-group-item').each(function(key, value){

                var titulo = $(value).find('.card-title').text().trim()
                var link = $(value).find('.card-title').find('a').eq(0).attr('href')
                
                if(titulo.length != 0){
                    
                    var subTitulo = $(value).find('.card-secondary-subtitle').text().trim()

                    var organizacao = {
                        'organization_name':titulo,
                        subTitulo:subTitulo,
                        link: link,
                        source: 'gust'
                    }

                   organizacoesPagina.push(organizacao)                

                }

                if(key == (totalItems - 1)){
                    resolve(organizacoesPagina)
                }

            })
        })

        // Entra no link de detalhes de cada organização e captura os dados
        promise.then(function(organizacoesPagina){
            
            var promiseDetalhe = new Promise(function(resolve, reject){
                
                _organizacoesPagina = []

                organizacoesPagina.forEach(function(organizacao, index){

                    var urlDetalhe = 'https://gust.com' + organizacao.link

                    var requestOptions = {
                        uri: urlDetalhe,
                        resolveWithFullResponse: true,
                        headers:{
                            'Cookie':cookies
                        }
                    }

                    rp(requestOptions).then(function(response){

                        var body = response.body
                        var $ = cheerio.load(body)
                        
                        // Recupera o sumario dos dados da organização
                        var summary = $('#group_general_info_page').find('div.row').eq(1).find('div').eq(0).text().split('·')

                        // console.log(summary)

                        // ### Separa os dados em propriedades ###

                        if(summary.length > 1){

                            console.log(summary)

                            // Categoria
                            organizacao.category = summary[0].split('\n\n\n')[1].trim()
                            
                            // Total de membros
                            var temp = summary[1].replace(/\n/g, '').trim()
                            temp = temp.match(/[0-9]+/g).join('')

                            organizacao.total_members = temp

                            // Cidade / Estado / País
                            var temp = summary[2].replace(/\n/g, '').trim().split(',')

                            // console.log(temp)

                            organizacao.city = temp[0] == undefined ? '' : temp[0].trim()
                            organizacao.state = temp[1] == undefined ? '' : temp[1].trim()
                            organizacao.country = temp[2] == undefined ? '' : temp[2].trim()

                            _organizacoesPagina.push(organizacao)

                            delete organizacao.subTitulo
                            delete organizacao.link

                            conn.query('INSERT INTO tbl_organizations SET ?', organizacao, function(err, rows, fields){

                                if(err) throw err

                                console.log('Organizacao salva com sucesso no mysql')
                                
                                var id = rows.insertId

                                var setores = $('.list-unstyled').find('li').each(function(key, item){
                                    
                                    var setor = {
                                        'id_organization': id,
                                        'sector': $(item).text().trim()
                                    }

                                    conn.query("INSERT INTO tbl_preferred_sectors SET ?", setor, function(err, rows, fields){
                                        console.log('Setor salvo com sucesso')
                                    })
                                })

                            })
                        }



                        if(index == (organizacoesPagina.length - 1)){
                            resolve(_organizacoesPagina)
                        }

                    })

                })
            })
            
            promiseDetalhe.then(function(_organizacoesPagina){

                console.log(_organizacoesPagina)

                if(index == totalPaginas){
                    callback(organizacoes)
                }
                else{

                    console.log('Iniciando pesquisa na proxima pagina ...')

                    organizacoes = organizacoes.concat(organizacoesPagina)
                    console.log(organizacoesPagina)

                    setTimeout(function(){
                        var _index = index + 1
                        getListOrganizations(cookies, _index, totalPaginas, organizacoes, callback)

                    }, 1000)

                }
            })
            
        })

            
    })


}


getInvestorsGust()

module.exports = {
    getInvestorsGust : getInvestorsGust
}