
var rp = require('request-promise').defaults({ simple: false })
var cheerio = require('cheerio')
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/startup-db"
var Mongodb = ''

MongoClient.connect(url, function(err, db) {
    console.log('MongoClient conectado com sucesso!')
    Mongodb = db

    // => Deleta Coleção
    // Mongodb.collection('organizations').remove({}, function(err, numberRemoved){
    //     if(err) throw err
    //     console.log('Total removed: ' + numberRemoved)
    //     process.exit()
    // })
})

// Função para retornar numero aleatorio entre determinado range

var lastRandom = 0
var minRange = 2000

function getRandomArbitrary(min, max, callback) {

    var numRandom = Math.random() * (max - min) + min
    var diff = Math.abs((numRandom - lastRandom))
    
    if(diff >= minRange){
        lastRandom = numRandom
        callback(numRandom)
    }
    else{
        // console.log('Numero aleatorio acima do range! Tentando novamente!')
        getRandomArbitrary(min, max, callback)
    }

}

// Array contendo as letras que serão usadas no filtro
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

var getNextHeaderIndex = function(curHeaderIndex, headers){

    var len = headers.length
    var nextIndex = 0;

    if(curHeaderIndex < (len - 1)){
        nextIndex = curHeaderIndex + 1
    }

    return nextIndex

}

// Valida sessão no site da CrunchBase

var validateSession = function(login, password, headerIndex, callback){

    var headers = [
        {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'origin': 'https://www.crunchbase.com',
            'referer': 'https://www.crunchbase.com/login',
            'x-requested-with': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'accept-encoding':'gzip, deflate, br',
            // 'accept': 'application/json, text/plain, */*',
            // 'content-type':'application/json',
        },
        {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'origin': 'https://www.crunchbase.com',
            'referer': 'https://www.crunchbase.com/login',
            'x-requested-with': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            // 'accept-encoding':'gzip, deflate, br',
            // 'accept': 'application/json, text/plain, */*',
            // 'content-type':'application/json',
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/login',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'Cache-control': 'no-cache',
            // 'Accept-encoding':'gzip, deflate, br',
            'Accept': 'application/json, text/plain, */*',
            'content-type':'application/json',
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/login',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'Cache-control': 'no-cache',
            'Accept-encoding':'gzip, deflate, br',
            'Accept': 'application/json, text/plain, */*',
            'content-type':'application/json',
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/login',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'Cache-control': 'no-cache',
            'Accept-encoding':'gzip, deflate, br',
            'Accept': 'application/json, text/plain, */*',
            'content-type':'application/json',
        }

    ]

    // Efetua o login na CrunchBase

    var url = 'https://www.crunchbase.com/v4/cb/sessions'

    var requestOptions = {
        method: 'POST',
        uri : url,
        resolveWithFullResponse: true,
        json: true,
        gzip: true,
        body : {
            'email': login,
            'password': password
        },
        headers: headers[headerIndex]
    }

    console.log('Autenticando ...')
    
    rp(requestOptions).then(function(response){

        console.log('Autenticacao executada com sucesso')
        
        console.log(response.headers)
        console.log(response.statusCode)
        console.log(response.body)

        var body = response.body

        if(typeof body == 'object'){

            var jsonLoginValidate = eval(response.body)
            
            // console.log(jsonLoginValidate)
            // process.exit()

            var cookies = []

            cookies.push(response.headers['set-cookie'][0].split(';')[0])
            cookies.push(response.headers['set-cookie'][1].split(';')[0])
            cookies.push(response.headers['set-cookie'][2].split(';')[0])

            console.log('Recuperando cookies iniciais ...')
            console.log(cookies)
            console.log('=====================================')

            // process.exit()

            var config = {
                cookies: cookies,
                jsonLoginValidate: jsonLoginValidate
            }

            callback(config)

        }
        else{

            console.log('Headers de Login mudaram !!!')

            var nextHeaderIndex = getNextHeaderIndex(headerIndex, headers)
            console.log('Next header index: ' + nextHeaderIndex)

            setTimeout(function(){
                validateSession(login, password, nextHeaderIndex, callback)

            }, 3000)

        }
    })

}

var getOrganizations = function(charLetter1, charLetter2, charLetter3){

    // conn.query("DELETE FROM tbl_organizations WHERE source = 'crunchbase'")
    // conn.query("DELETE FROM tbl_preferred_sectors WHERE source = 'startse'")

    var cookies = []

    var login = 'jairohighwind@hotmail.com'
    var password = 'wizard10'

    // Recupera o index dos char's
    var indexLetter1 = letters.indexOf(charLetter1)
    var indexLetter2 = letters.indexOf(charLetter2)
    var indexLetter3 = letters.indexOf(charLetter3)

    return new Promise(function(resolve, reject){

        validateSession(login, password, 0, function(config){

            var organizacoes = []

            getListOrganizations(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, 0, function(result){
                
                console.log('Lista de Organizacoes/Instituicoes recuperada com sucesso')

            })

        })

    })

}


var getListOrganizations = function(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, headerIndex, callback){

    var headers = [

        {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'origin': 'https://www.crunchbase.com',
            'referer': 'https://www.crunchbase.com/login',
            'x-requested-with': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            // 'accept-encoding':'gzip, deflate, br',
            'accept': 'application/json, text/plain, */*',
            'content-type':'application/json',
        },
        {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'origin': 'https://www.crunchbase.com',
            'referer': 'https://www.crunchbase.com/login',
            'x-requested-with': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            // 'accept-encoding':'gzip, deflate, br',
            'accept': 'application/json, text/plain, */*',
            'content-type':'application/json',
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept':'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            'accept-encoding':'gzip, deflate, br'     
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept':'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            // 'accept-encoding':'gzip, deflate, br'     
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept':'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            'accept-encoding':'gzip, deflate, br'     
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept':'application/json, text/plain, */*',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            'accept-encoding':'gzip, deflate, br'     
        }
    ]

    // Define as novas tres letras para o filtro
    var curLetter1 = letters[indexLetter1]
    var curLetter2 = letters[indexLetter2]
    var curLetter3 = letters[indexLetter3]

    var curValueFilter = curLetter1 + curLetter2 + curLetter3

    console.log('Iniciando pesquisa do filtro ' + curValueFilter)
    console.log('=================================================')

    // Solicita um lote de companies para o EndPoint da CrunchBase
    var url = 'https://www.crunchbase.com/v4/data/searches/organization.companies'

    var xsrfToken = config.cookies[0].replace('XSRF-TOKEN=', '')

    var requestOptions = {
        method: 'POST',
        uri: url,
        resolveWithFullResponse: true,
        json: true,
        gzip: true,
        body:{
            "field_ids": [
                "identifier",
                "categories",
                "location_identifiers",
                "short_description",
                "rank_org_company",
                "operating_status",
                "founded_on",
                "closed_on",
                "company_type",
                "website",
                "twitter",
                "facebook",
                "linkedin",
                "contact_email",
                "phone_number",
                "num_articles",
                "investor_type",
                "investor_stage",
                "num_portfolio_organizations",
                "num_investments_funding_rounds",
                "num_lead_investments",
                "num_exits",
                "program_type",
                "program_application_deadline",
                "program_duration",
                "category_groups",
                "num_founders",
                "num_employees_enum",
                "num_investors",
                "num_lead_investors",
                "acquisition_status",
                "ipo_status",
                "went_public_on",
                "ipo_amount_raised",
                "delisted_on",
                "ipo_valuation",
                "stock_symbol",
                "stock_exchange_symbol",
                "rank_org",
                "rank_org_school",
                "rank_delta_d7",
                "rank_delta_d30",
                "rank_delta_d90"
            ],
            "order": [
                {
                    "field_id": "rank_org_company",
                    "sort": "asc"
                }
            ],
            "query": [
                {
                    "type": "predicate",
                    "field_id": "identifier",
                    "operator_id": "starts",
                    "values": [
                        curValueFilter
                    ]
                }
            ],
            "field_aggregators": [],
            "limit": 1000,
            "collection_id": "organization.companies"
        },
        headers: headers[headerIndex]
    }
    
    rp(requestOptions).then(function(response){

        var statusCode = response.statusCode

        // Se request falhou tentar novamente!
        if(statusCode != 200){
            console.log(statusCode)
            setTimeout(function(){
                getListOrganizations(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, headerIndex, callback)
            }, 3000)
        }
        else{

            var body = response.body
            
            if(typeof body == 'object'){

                var jsonCompanies = eval(response.body)

                // console.log(jsonCompanies.entities)

                var totalCompanies = jsonCompanies.entities.length
                console.log('Total Companies: ' + totalCompanies)

                // Salva os dados no MariaDb
                jsonCompanies.entities.forEach(function(value, index) {

                    // conn.collection('organizations').insert(value.properties)                        
                    Mongodb.collection('organizations').insertOne(value.properties, function(err, res){

                        if(err) throw err
                        console.log('1 document inserted')
                    })

                })



                // Define os proximas 3 letras

                var newIndexLetter1 = 0
                var newIndexLetter2 = 0
                var newIndexLetter3 = 0
                
                if(indexLetter3 == (letters.length - 1)){
                    
                    if(indexLetter2 == (letters.length - 1)){

                        if(indexLetter1 == (letters.length - 1)){
                            console.log('FINALIZADO')
                            process.exit()
                        }
                        else{
                            newIndexLetter1 = indexLetter1 + 1
                        }
                    }
                    else{
                        newIndexLetter1 = indexLetter1
                        newIndexLetter2 = indexLetter2 + 1
                    }
                }
                else{
                    newIndexLetter1 = indexLetter1
                    newIndexLetter2 = indexLetter2
                    newIndexLetter3 = indexLetter3 + 1
                }

                console.log('Filtro ' + curValueFilter + ' finalizado!')
                console.log('Iniciando pesquisa do proximo filtro ...')

                console.log(newIndexLetter1, newIndexLetter2, newIndexLetter3)

                if(newIndexLetter1 == 38 && newIndexLetter2 == 38 && newIndexLetter3 == 38){
                    console.log('Web Scraping do Crunch Base finalizado!')
                }
                else{

                    // Recupera um numero aleatorio para ser usado no setTimeout
                    
                    getRandomArbitrary(3000, 7000, function(_timeout){

                        setTimeout(function(){
                            getListOrganizations(config, organizacoes, newIndexLetter1, newIndexLetter2, newIndexLetter3, headerIndex, callback)

                        }, _timeout)

                    })
                }

            }
            else{

                console.log('Mudança de header!!!')

                var nextHeaderIndex = getNextHeaderIndex(headerIndex, headers)
                console.log('Header Index Next: ' + nextHeaderIndex)
                setTimeout(function(){
                    getListOrganizations(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, nextHeaderIndex, callback)
                }, 5000)
            }

        }


    }).catch(function(err){

        console.log('Erro ao iniciar pesquisa do filtro')
        console.log('===============================================')
        console.log(err)
        console.log('Tentando novamente ...')

        setTimeout(function(){
            getListOrganizations(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, headerIndex, callback)
        }, 5000)
        
    })


}

var getInvestors = function(charLetter1, charLetter2, charLetter3){

    // conn.query("DELETE FROM tbl_organizations WHERE source = 'crunchbase'")
    // conn.query("DELETE FROM tbl_preferred_sectors WHERE source = 'startse'")

    var cookies = []

    var login = 'jairohighwind@hotmail.com'
    var password = 'wizard10'

    // Recupera o index dos char's
    var indexLetter1 = letters.indexOf(charLetter1)
    var indexLetter2 = letters.indexOf(charLetter2)
    var indexLetter3 = letters.indexOf(charLetter3)

    return new Promise(function(resolve, reject){

        validateSession(login, password, 0, function(config){

            var organizacoes = []

            getListInvestors(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, 0, function(result){
                
                console.log('Lista de Organizacoes/Instituicoes recuperada com sucesso')

            })

        })

    })

}

var getListInvestors = function(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, headerIndex, callback){

    var headers = [

        {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'origin': 'https://www.crunchbase.com',
            'referer': 'https://www.crunchbase.com/login',
            'x-requested-with': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            // 'accept-encoding':'gzip, deflate, br',
            'accept': 'application/json, text/plain, */*',
            'content-type':'application/json',
        },
        {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'origin': 'https://www.crunchbase.com',
            'referer': 'https://www.crunchbase.com/login',
            'x-requested-with': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            // 'accept-encoding':'gzip, deflate, br',
            'accept': 'application/json, text/plain, */*',
            'content-type':'application/json',
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            // 'accept':'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            'accept-encoding':'gzip, deflate, br'     
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept':'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            // 'accept-encoding':'gzip, deflate, br'     
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept':'application/json, text/plain, */*',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            'accept-encoding':'gzip, deflate, br'     
        },
        {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Cookie': config.cookies,
            'x-xsrf-token' : xsrfToken,
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/search/organization.companies',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept':'application/json, text/plain, */*',
            // 'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'cache-control': 'no-cache',
            'accept-encoding':'gzip, deflate, br'     
        }
    ]

    // Define as novas tres letras para o filtro
    var curLetter1 = letters[indexLetter1]
    var curLetter2 = letters[indexLetter2]
    var curLetter3 = letters[indexLetter3]

    var curValueFilter = curLetter1 + curLetter2 + curLetter3

    console.log('Iniciando pesquisa do filtro ' + curValueFilter)
    console.log('=================================================')

    // Solicita um lote de companies para o EndPoint da CrunchBase
    var url = 'https://www.crunchbase.com/v4/data/searches/principal.investors'

    var xsrfToken = config.cookies[0].replace('XSRF-TOKEN=', '')

    var requestOptions = {
        method: 'POST',
        uri: url,
        resolveWithFullResponse: true,
        json: true,
        gzip: true,
        body:{
            "field_ids": [
                "identifier",
                "num_investments_funding_rounds",
                "num_exits",
                "location_identifiers",
                "investor_stage",
                "investor_type",
                "short_description",
                "first_name",
                "last_name",
                "gender",
                "description",
                "num_articles",
                "twitter",
                "linkedin",
                "facebook",
                "primary_organization",
                "num_founded_organizations",
                "primary_job_title",
                "num_portfolio_organizations",
                "num_lead_investments",
                "num_partner_investments",
                "num_event_appearances",
                "rank_person",
                "rank_delta_d7",
                "rank_delta_d30",
                "rank_delta_d90",
                "program_application_deadline",
                "program_duration",
                "program_type",
                "rank_principal_investor"
            ],
            "order": [
                {
                    "field_id": "num_investments_funding_rounds",
                    "sort": "asc"
                }
            ],
            "query": [
                {
                    "type": "predicate",
                    "field_id": "identifier",
                    "operator_id": "starts",
                    "values": [
                        curValueFilter
                    ]
                }
            ],
            "field_aggregators": [],
            "limit": 1000,
            "collection_id": "principal.investors"
        },
        headers: headers[headerIndex]
    }
    
    rp(requestOptions).then(function(response){

        var statusCode = response.statusCode

        // Se request falhou tentar novamente!
        if(statusCode != 200){
            console.log(statusCode)
            setTimeout(function(){
                getListInvestors(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, headerIndex, callback)
            }, 3000)
        }
        else{

            var body = response.body
            
            if(typeof body == 'object'){

                var jsonCompanies = eval(response.body)

                // console.log(jsonCompanies.entities)

                var totalCompanies = jsonCompanies.entities.length
                console.log('Total Investors: ' + totalCompanies)

                // Salva os dados no MariaDb
                jsonCompanies.entities.forEach(function(value, index) {

                    Mongodb.collection('investors').insertOne(value.properties, function(err, res){

                        if(err) throw err
                        console.log('1 document investor inserted')
                    })

                })



                // Define os proximas 3 letras

                var newIndexLetter1 = 0
                var newIndexLetter2 = 0
                var newIndexLetter3 = 0
                
                if(indexLetter3 == (letters.length - 1)){
                    
                    if(indexLetter2 == (letters.length - 1)){

                        if(indexLetter1 == (letters.length - 1)){
                            console.log('FINALIZADO')
                            process.exit()
                        }
                        else{
                            newIndexLetter1 = indexLetter1 + 1
                        }
                    }
                    else{
                        newIndexLetter1 = indexLetter1
                        newIndexLetter2 = indexLetter2 + 1
                    }
                }
                else{
                    newIndexLetter1 = indexLetter1
                    newIndexLetter2 = indexLetter2
                    newIndexLetter3 = indexLetter3 + 1
                }

                console.log('Filtro ' + curValueFilter + ' finalizado!')
                console.log('Iniciando pesquisa do proximo filtro ...')

                console.log(newIndexLetter1, newIndexLetter2, newIndexLetter3)

                if(newIndexLetter1 == 38 && newIndexLetter2 == 38 && newIndexLetter3 == 38){
                    console.log('Web Scraping do Crunch Base finalizado!')
                }
                else{

                    // Recupera um numero aleatorio para ser usado no setTimeout
                    
                    getRandomArbitrary(3000, 7000, function(_timeout){

                        setTimeout(function(){
                            getListInvestors(config, organizacoes, newIndexLetter1, newIndexLetter2, newIndexLetter3, headerIndex, callback)

                        }, _timeout)

                    })
                }

            }
            else{

                console.log('Mudança de header!!!')

                var nextHeaderIndex = getNextHeaderIndex(headerIndex, headers)
                console.log('Header Index Next: ' + nextHeaderIndex)
                setTimeout(function(){
                    getListInvestors(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, nextHeaderIndex, callback)
                }, 5000)
            }

        }


    }).catch(function(err){

        console.log('Erro ao iniciar pesquisa do filtro')
        console.log('===============================================')
        console.log(err)
        console.log('Tentando novamente ...')

        setTimeout(function(){
            getListInvestors(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, headerIndex, callback)
        }, 5000)
        
    })


}

// Inicia o scraping dos dados
getInvestors('Y', ' ', 'X')