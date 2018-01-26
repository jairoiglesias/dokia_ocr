


function distLatLong(lat1,lon1,lat2,lon2) {
  var R = 6371; // raio da terra em km
  var Lati =  Math.PI/180*(lat2-lat1);  
  var Long =  Math.PI/180*(lon2-lon1); 
  var a = 
    Math.sin(Lati/2) * Math.sin(Lati/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(Long/2) * Math.sin(Long/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // distância em km
  return d;
}

module.exports = function(app) {

  app.get('/upload_doc', (req, res) => {
    res.render('upload_doc')
  })

  

}