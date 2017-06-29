angular.module('app.services', [])

  /*service per condividere i dati tra le varie pagine*/
  .service('shareData', function () {
    return {
      setData: setData,
      getData: getData,
      shared_data: null
    };

    function setData(data) {
      this.shared_data = data
    }

    function getData() {
      return this.shared_data
    }
  })

//funzione che ritorna il layer contenente il tragitto
.service('Layer', function(){
    window.posizione=new Array();
    //funzione ritorna coordinate gps in un array
    this.GpsPosition=function(){
      var onSuccess = function(position) {
        console.log("ppppp: "+position.coords.longitude +" "+ position.coords.latitude)
            window.posizione.push(position.coords.longitude);
            window.posizione.push(position.coords.latitude);
            console.log(window.posizione)
      };
      function onError(error) {
        console.log('code: '+ error.code + 'message: ' + error.message);
      }
      navigator.geolocation.getCurrentPosition(onSuccess,onError);
    }

    this.viewLayer=function(object){
        if(object.getVisible())
            object.setVisible(false);
        else
            object.setVisible(true);
       };

    this.lineLayer=function(array,difficolta){
      if(difficolta == 'T')
        colore = 'lightgreen';
        else if(difficolta == 'E' )
          colore = 'yellow';
          else if(difficolta == 'EE' )
            colore = 'red';
            else
              colore ='white';

        var lineString = new ol.geom.LineString(array);
        lineString.transform('EPSG:4326', 'EPSG:3857');
         var lineLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [new ol.Feature({
                    geometry: lineString,
                    name: 'Line'
                })]
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({color: colore, width: 3}),
            })
        });
        map.addLayer(lineLayer);
        var punto=new Array();
        var obj= {
                    "id": "",
                    "nom_poi": "",
                    "src":"",
                    "description":"",
                    "coordinates": array[0],
                    "nom_itiner": "",
                    "percorso": "",
                    "tipo_perc": "",
                    "cod_tipo": "",
                 };
        punto.push(obj);
        map.addLayer(this.posizionaPunto(punto,'icon/partenza.png'));
        var punto=new Array();
        var obj= {
                    "id": "",
                    "nom_poi": "",
                    "src":"",
                    "description":"",
                    "coordinates": array[array.length-1],
                    "nom_itiner": "",
                    "percorso": "",
                    "tipo_perc": "",
                    "cod_tipo":""
                 };
        punto.push(obj);
        map.addLayer(this.posizionaPunto(punto,'icon/arrivo.png'));

    }

      /*funzione che visualizza un marker sulla mappa paramitri di input:
            x,y=coordinate
            name=nome marker
            src=icona del marker
         */
    this.posizionaPunto=function(array,src){
        var vectorLayer;
        console.log(src);
        if(array=="1"){
            array=window.infoPois;
        }
        var iconFeature= new Array();

        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: src
          }))
        });

        array.forEach(function(record){
            var obj = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform(record.coordinates, 'EPSG:4326', 'EPSG:3857')),
                nom_poi: record.nom_poi,
                src:record.src,
                description:record.description,
                coordinates: record.coordinates,
                nom_itiner: record.nom_itiner,
                percorso: record.percorso.replace(/\'/g, ' '),
            });
            obj.setStyle(iconStyle);
            iconFeature.push(obj);
        });

         //Vettore che contiene le features dei marker
        var vectorSource = new ol.source.Vector({
          features: iconFeature
        });

      // Layer per la visualizzazione dei vettori dei marker
         vectorLayer = new ol.layer.Vector({
          source: vectorSource
        });

      return vectorLayer;
    };

})


.service('dati', function() {
    window.infoPois = new Array();
    window.infoPaths = new Array();

    this.setInfo = function($http,$ionicPopup,$window){
        var urlPoi = "datiPoi/POI.json";
        var urlPathInfo = "datiPoi/PATH.json";
        var urlPathLine = "datiPoi/PATH.xml";
        /*
         * Da decommentare alla fine
        var urlPoi = 'http://www.geosec.cnr.it/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Ischia:CiroRomano_shp_poi&maxFeatures=1000000&outputFormat=json';
        var urlPathInfo = 'http://www.geosec.cnr.it/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Ischia:CiroRomano_shp_sentieri&maxFeatures=1000000&outputFormat=json';
        var urlPathLine = 'http://www.geosec.cnr.it/geoserver/wms/reflect?&layers=Ischia:CiroRomano_shp_sentieri&format=rss';
        */

        var dataDownload = new Date(localStorage.getItem('Data'));
        var app = new Date();
        var dataUpgrade = new Date(app.getFullYear(),app.getMonth(),app.getDate());

        //Da decommentare alla fine
        //if((navigator.connection.type.toLowerCase() != 'none')&&(dataUpgrade > dataDownload)){
        if(1){
            $http.get(urlPoi)
            .success(function(data, status, headers, config){
                localStorage.setItem('POI', JSON.stringify(data));
                setPoi();
            })
            .error(function(status)
            {
                var alert = $ionicPopup.alert({
                    title: 'ERRORE',
                    template: 'Riprovare più tardi!'
                });
                alert.then(function() {
                    $window.location.reload();
                });
            });

            $http.get(urlPathInfo)
            .success(function(data, status, headers, config){
                localStorage.setItem('PATH_INFO', JSON.stringify(data));
                setPathInfo();
            })
            .error(function(status)
            {
                var alert = $ionicPopup.alert({
                    title: 'ERRORE',
                    template: 'Riprovare più tardi!'
                });
                alert.then(function() {
                    $window.location.reload();
                });
            });

            $http.get(urlPathLine)
            .success(function(data, status, headers, config){
                localStorage.setItem('PATH_LINE', data);
                setPathLine();
            })
            .error(function(status)
            {
                var alert = $ionicPopup.alert({
                    title: 'ERRORE',
                    template: 'Riprovare più tardi!'
                });
                alert.then(function() {
                    $window.location.reload();
                });
            });

            localStorage.setItem('Data', dataUpgrade);
        }
        else {
            if((localStorage.getItem('POI') == null)||(localStorage.getItem('PATH_INFO') == null)||(localStorage.getItem('PATH_LINE') == null)){
                var alert = $ionicPopup.alert({
                    title: 'CONNESSIONE ASSENTE',
                    template: 'Riprovare più tardi!'
                });
                alert.then(function() {
                    $window.location.reload();
                });
            }
            else{
                setPoi();
                setPathInfo();
                setPathLine();
            }
        }
    }

    setPoi = function(){
        var features = JSON.parse(localStorage.getItem('POI')).features;
        features.forEach(function(record){
            var obj= {
                "id": record.id,
                "nom_poi": record.properties.NOM_POI,
                "coordinates": record.geometry.coordinates,
                "src":"",
                "description":"",
                "nom_itiner": record.properties.NOM_ITINER.replace(/\'/g, ' '),
                "percorso": record.properties.PERCORSO.replace(/\'/g, ' '),
                "tipo_perc": record.properties.TIPO_PERC,
                "cod_tipo": record.properties.COD_TIPO
            };
            window.infoPois.push(obj);
        });
    }

    setPathInfo = function(){
        var features = JSON.parse(localStorage.getItem('PATH_INFO')).features;
        features.forEach(function(record){
            var obj= {
                "id": record.id,
                "percorso": record.properties.PERCORSO.replace(/\'/g, ' '),
                "nom_itiner": record.properties.NOM_ITINER,
                "coordinates": null,
                "tipo_perc": record.properties.TIPO_PERC,
                "cod_tipo": record.properties.COD_TIPO
            };
            window.infoPaths.push(obj);
        });
    }

    setPathLine = function(){
        var path;
        var parser = new DOMParser();
        xmlDoc = parser.parseFromString(localStorage.getItem('PATH_LINE'),"text/xml");
        var item = xmlDoc.getElementsByTagName("item");
        for(var j=0;j<item.length;j++)
        {
            var line = item[j].childNodes[4].innerHTML;
            if(!line)
              var line = item[j].childNodes[4].firstChild.nodeValue;
            var coors = line.split(" ");
            path = new Array();
            for(var i=0;i<(coors.length);i+=2){
                coors[i]=parseFloat(coors[i]);
                coors[i+1]=parseFloat(coors[i+1]);
                var app = [coors[i+1],coors[i]];
                path.push(app);
            }
            window.infoPaths[j].coordinates = path;
        }
    }
})
.service('ontology', function() {
    
    window.myJson=new Array();
    
    var prefixQuery = "PREFIX ontology: <http://www.geonames.org/ontology#> PREFIX propCoordinate: <http://www.w3.org/2003/01/geo/wgs84_pos#>"
        +"PREFIX tipo: <http://www.geonames.org/ontology#featureCode> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>";

    var baseQuery = " SELECT ?nome ?longitudine ?latitudine WHERE {"
        +"?subject ontology:name ?nome. ?subject propCoordinate:lat ?longitudine."
        +"?subject propCoordinate:long ?latitudine.";
    
    var url_to_endpoint = 'http://localhost:3030/IschiaMap/query';
    
    this.hotel = function($http){
        var url_to_endpoint = 'http://localhost:3030/IschiaMap/query';
        var query = "PREFIX ontology: <http://www.geonames.org/ontology#> PREFIX propCoordinate: <http://www.w3.org/2003/01/geo/wgs84_pos#>"
        +"PREFIX tipo: <http://www.geonames.org/ontology#featureCode>"
        +" SELECT ?nome ?longitudine ?latitudine WHERE {"
        +"?subject ontology:name ?nome. ?subject propCoordinate:lat ?longitudine."
        +"?subject propCoordinate:long ?latitudine. {{?subject tipo:<http://www.geonames.org/ontology#S.HTL>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.MUS>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.CH>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.GDN>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.OBPT>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.SQR>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.STDM>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.CSTL>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.ZOO>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.THTR>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#S.ATHF>.}}}";

        var queryUrl = url_to_endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
        $http.get(queryUrl)
        .success(function(data, status, headers, config){
            loading($http,data,2,0);
        
        })
        .error(function(status)
        {
            loading($http,status,2,0);
        });         
    }
    
    function loading($http,url,n,controllo){
        var array=new Array();
        //console.log(url.results.bindings)
        url.results.bindings.forEach(function(record){
            var src, descrizione;    
            if(controllo){
                src=record.foto.value;    
                descrizione=record.descrizione.value;       
            }else{
                src="";
                descrizione="";
            }
            var obj= {
                "id": "",
                "nom_poi": record.nome.value,
                "src":src,
                "description":descrizione,
                "coordinates": [parseFloat(record.latitudine.value),parseFloat(record.longitudine.value)],
                "nom_itiner": "",
                "percorso": "",
                "tipo_perc": "",
                "cod_tipo":""
            };
            array.push(obj);
        });
        window.myJson[n]=array;
    }
   
    
    this.vari = function($http){        
        var queryVari = prefixQuery + baseQuery
        +" {{?subject tipo:<http://www.geonames.org/ontology#L.AMUS>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#L.PRK>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#T.VLC>.}}}";

        var queryUrl = url_to_endpoint + "?query=" + encodeURIComponent(queryVari) + "&format=json";

        $http.get(queryUrl)
        .success(function(data, status, headers, config){
            loading($http,data,1,0);
        })
        .error(function(status)
        {
            loading($http,status,1,0);
        });  
    }
    
    this.spiaggia = function($http){     
        var querySpiaggia = prefixQuery + baseQuery
        +" {{?subject tipo:<http://www.geonames.org/ontology#T.PT>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#T.BCH>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#L.PRT>.}"
        +"UNION {?subject tipo:<http://www.geonames.org/ontology#T.CAPE>.}}}";

        var queryUrl = url_to_endpoint + "?query=" + encodeURIComponent(querySpiaggia) + "&format=json";

        $http.get(queryUrl)
        .success(function(data, status, headers, config){
            loading($http,data,0,0);
        })
        .error(function(status)
        {
            loading($http,status,0,0);        
        });  
    }
    
    this.addPoi = function($http,uID,idPoi,nome,lat,long,descrizione,photo){     
        var addpoint = prefixQuery
        +"INSERT{<http://sws.geonames.org/"+ uID +"/"+ idPoi +"> ontology:name "+ nome +";"
  	+"ontology:featureClass ontology: T;"
        +"ontology:featureCode ontology: T.myPOIS;"
        +"ontology:countryCode 'IT';"
        +"propCoordinate:lat "+ lat +";"
        +"propCoordinate:long "+ long +";"
        +"ontology:parentCountry <http://sws.geonames.org/3175395/>;"
        +"ontology:parentADM1 <http://sws.geonames.org/3181042/>;"
        +"ontology:parentADM2 <http://sws.geonames.org/3172391/>;"
        +"ontology:details "+ descrizione +";"
	+"ontology:photo "+ photo +"."
        +"}WHERE{}";

        var queryUrl = "http://localhost:3030/IschiaMap/update?update="  + encodeURIComponent(addpoint) ;
        var req = {
            method: 'POST',
            url: queryUrl,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: { test: 'test' }
        }
        $http(req)
        .success(function(data, status, headers, config){
            console.log("data:"+status);
        })
        .error(function(status)
        {
            console.log(status);
        });  
    }
    
    this.myPois = function($http){        
        var queryMyPois = prefixQuery
        +"SELECT ?nome ?longitudine ?latitudine ?descrizione ?foto WHERE {"
        +"?subject ontology:name ?nome. ?subject propCoordinate:lat ?longitudine."
        +"?subject propCoordinate:long ?latitudine. ?subject ontology:details ?descrizione."
        +"?subject ontology:photo ?foto. ?subject tipo:<http://www.geonames.org/ontology#T.myPOIS>.}";

        var queryUrl = url_to_endpoint + "?query=" + encodeURIComponent(queryMyPois) + "&format=json";

        $http.get(queryUrl)
        .success(function(data, status, headers, config){
            loading($http,data,3,1);
        })
        .error(function(status)
        {
            loading($http,status,3,1);
        });  
    }
})

