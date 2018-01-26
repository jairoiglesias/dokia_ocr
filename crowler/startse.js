
var rp = require('request-promise').defaults({ simple: false })
var cheerio = require('cheerio')
var conn = require('./../libs/connectdb.js')()

 var getInvestors = function(){

    conn.query("DELETE FROM tbl_organizations WHERE source = 'startse'")
    // conn.query("DELETE FROM tbl_preferred_sectors WHERE source = 'startse'")

    var cookies = []

    var login = 'jairohighwind@hotmail.com'
    var password = 'wizard10'

    return new Promise(function(resolve, reject){

        var url = 'https://startse.com/index/login'

        var requestOptions = {
            method: 'POST',
            uri : url,
            resolveWithFullResponse: true,
            form : {
                'email': login,
                'password': password
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
            }
        }

        rp(requestOptions).then(function(response){

            console.log('Recuperando cookies iniciais')
            // console.log(response.headers)
            // console.log(response.body)
            cookies.push(response.headers['set-cookie'][0].split(';')[0])

            console.log('Recuperando cookies iniciais ...')
            console.log(cookies)
            console.log('=====================================')


            var config = {
                cookies: cookies,
                index: 2
            }

            var organizacoes = []

            getListOrganizations(config, organizacoes, function(result){

                console.log('Lista de Organizacoes/Instituicoes recuperada com sucesso')

            })

        })

    })

}

var getListOrganizations = function(config, organizacoes, callback){

    var url = 'https://startse.com/institutions'

    var requestOptions = {
        method: 'POST',
        uri: url,
        resolveWithFullResponse: true,
        form: {
            'tipo[]': config.index,
            'search': ''
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
    }

    rp(requestOptions).then(function(response){

        var body = response.body
        var $ = cheerio.load(body)

        // Efetua o mapeamento de dados contidos na pagina
        var promise = new Promise(function(resolve, reject){

            var totalItems =  $('.infinite-item').length
            var totalResolved = 0

            $('.infinite-item').each(function(key, value){
                var href = $(this).find('a').attr('href')

                var requestOptions = {
                    url: href,
                    resolveWithFullResponse: true,
                    headers: {
                        'Cookie': config.cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
                    }
                }

                rp(requestOptions).then(function(response){

                    var body = response.body
                    var $ = cheerio.load(body)

                    var nome = $('.col-md-12').find('h3').text().trim()
                    var categoria = $('.col-md-12').find('h4.h4-lines-1').text().trim()
                    
                    var endereco = $('.col-md-12').find('p.p-lines-1').text().trim()
                    endereco = endereco.split(',')

                    var cidade = endereco[0] == undefined ? '' : endereco[0].trim()
                    var estado = endereco[1] == undefined ? '' : endereco[1].trim()
                    var pais = endereco[1] == undefined ? '' : endereco[1].trim()

                    var site = $('.col-md-12').find('a.mr-15').attr('href')
                    var facebook = $('.col-md-12').find('i.fa-facebook').parent().attr('href')
                    var linkedin = $('.col-md-12').find('i.fa-linkedin').parent().attr('href')
                    var instagram = $('.col-md-12').find('i.fa-instagram').parent().attr('href')

                    var titulo = $('div.col-md-8').find('p.lead').text().trim()
                    var descricao = $('div.col-md-8').find('p').eq(1).text().trim()

                    var organizacao = {
                        'organization_name': nome,
                        'category': categoria,
                        'city': cidade,
                        'state': estado,
                        'country' : pais,
                        'site': site,
                        'facebook':facebook,
                        'linkedin': linkedin,
                        'instagram': instagram,
                        'title': titulo,
                        'description': descricao,
                        'source' : 'startse'
                    }

                    organizacoes.push(organizacao)

                     conn.query('INSERT INTO tbl_organizations SET ?', organizacao, function(err, rows, fields){

                        if(err) throw err

                        console.log('Organizacao salva com sucesso no mysql')

                     })

                    totalResolved++
                    
                    if(totalResolved == totalItems){
                        resolve()
                    }

                })

            })

        })

        promise.then(function(){

            console.log('Organizacoes do filtro: ' + config.index + " finalizado!")
            console.log(organizacoes)

            if(config.index == 12){
                callback('1')
            }
            else{
                // Inicia o scrap da proximo filtro de organizacoes
                config.index += 1
                getListOrganizations(config, organizacoes, callback)
            }

        })



    })

}

getInvestors()