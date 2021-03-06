angular.module('app.controllers', [])

        .controller('percorsoCtrl', ['$scope', '$stateParams',
            function ($scope, $stateParams) {
            }])

        .controller('cercaPercorsoCtrl', ['$scope', 'shareData', 'Layer', '$ionicPopup', 'ontology', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
            function ($scope, shareData, Layer, $ionicPopup, ontology) {
                $scope.difficoltaPOI = 0;
                $scope.difficoltaPATH = 0;

                //POI
                $scope.poiList = window.infoPois;

                $scope.visualizzaPOI = function (poi, personal, difficolta, img) {
                    console.log(img)
                    $scope.poiArr;
                    if (!personal) {//creazione array per mandarlo in posizionaPunto
                        $scope.poiArr = new Array();
                        $scope.poiArr.push(poi);
                    } else
                        $scope.poiArr = poi;

                    //visualizzazione anche del percorso
                    var myPathListArray = window.infoPaths;

                    $scope.listPaths = new Array();// PDNS: problema di dati non standardizzati

                    myPathListArray.forEach(function (path) {
                        if (path.percorso == poi.percorso && path.cod_tipo == difficolta) {
                            /*da decommentare se PDNS risolto*/
                            //$scope.visualizzaPercorso(path, path.cod_tipo);
                            $scope.listPaths.push(path)//PDNS
                        }
                    });
                    //centra la mappa sul poi
                    $scope.centraMappa(poi.coordinates);

                    /*PDNS risolta allora visualizza un solo poi
                     //visualizzazione del poi
                     var geosec = Layer.posizionaPunto(poiArr,img);
                     map.addLayer(geosec);
                     // shareData.setData(poi);
                     $scope.closeModal();
                     */

                    //PDNS-inizio: CONTROLLO SU PIU PERCORSI
                    if ($scope.listPaths.length > 1) {
                        $scope.closeModal();
                        var listPopup = $ionicPopup.show({
                            scope: $scope,
                            template: '<ion-list class="myPopup">' +
                                    '  <ion-item style="opacity: 0.5!important;color:#387EF5;font-weight: bold;" ' +
                                    '           ng-repeat="item in listPaths" ng-click="visualizzaListaPercorsiPOI(item)"> ' +
                                    '    Percorso {{$index+1}}                            ' +
                                    '  </ion-item>                             ' +
                                    '</ion-list>                               ',
                            title: $scope.listPaths[0].percorso,
                            subTitle: 'Seleziona Alternativa',
                            cssClass: 'myPopup myTitle mySubTitle',
                            buttons: [{
                                    text: 'Cancel',
                                    type: 'button-positive',
                                    onTap: function (e) {
                                        $scope.openModal();
                                        $scope.exit();
                                        return;
                                    }
                                }, {
                                    text: 'Visualizza',
                                    type: 'button-positive',
                                    onTap: function (e) {
                                        if ($scope.path) {
                                            viewPOIandPath($scope.path);
                                        } else
                                            e.preventDefault();
                                    }
                                },
                            ]
                        });
                    } else {
                        viewPOIandPath($scope.listPaths.pop());
                    }
                    //PDNS-fine
                }

                //PDNS-Inizio: visualizzazione percorso e poi
                $scope.visualizzaListaPercorsiPOI = function (path) {
                    $scope.exit()
                    viewPOIandPath(path);
                    // $scope.centraMappa(path[0].coordinates);
                }

                function viewPOIandPath(path) {
                    $scope.visualizzaPercorso(path, path.cod_tipo)
                    //visualizzazione del poi
                    var geosec = Layer.posizionaPunto($scope.poiArr, 'icon/geosec.png');
                    map.addLayer(geosec);
                }

                //PDNS-fine

                // Centra la mappa sul percorso o il poi selezionato
                $scope.centraMappa = function (x) {
                    var view = new ol.View({
                        center: ol.proj.fromLonLat(x),
                        zoom: 13.5,
                        minZoom: 11,
                        maxZoom: 19
                    });
                    map.setView(view);
                }

                //PERCORSI
                $scope.pathList = window.infoPaths;

                $scope.visualizzaPercorso = function (path, difficolta) {
                    //centra la mappa sul percorso
                    $scope.centraMappa(path.coordinates[0]);
                    document.getElementById('range_Map').style.bottom = "7px";
                    Layer.lineLayer(path.coordinates, difficolta);
                    shareData.setData(path);
                    $scope.closeModal();
                }

                //MIEI PERCORSI

                $scope.visualizzaListaIMieiPercorsi = function () {
                    //stampa la lista dei percorsi personali
                    var myPathLocalStorage = JSON.parse(localStorage.getItem('personalPOI'));
                    if (myPathLocalStorage) {//se localStorage è pieno
                        var obj;
                        var myPathListArray = new Array();
                        myPathLocalStorage.forEach(function (path) {

                            obj = {
                                id: path.id,
                                percorso: path.POIs[0].percorso,
                                tipo_perc: path.POIs[0].tipo_perc,
                                cod_tipo: path.POIs[0].cod_tipo,
                                num_poi_add: path.POIs.length,
                                POIs: path.POIs
                            };
                            myPathListArray.push(obj)
                        });
                        $scope.myPathList = myPathListArray;
                    } else {
                        $scope.myPathList = new Array();
                    }
                };

                $scope.goToMyPersonalPath = function (p) {
                    console.log("GOTO")
                    /*visualizza sulla mappa il percorso e poi*/
                    var pathPersonal = JSON.parse(p);

                    window.infoPaths.forEach(function (path) {
                        if (path.id == pathPersonal.id) {
                            $scope.visualizzaPercorso(path, path.cod_tipo);
                            var geosec = Layer.posizionaPunto(pathPersonal.POIs, 'icon/personali.png');
                            map.addLayer(geosec);
                        }
                    });
                    $scope.closeModal()
                };

                $scope.deletePath = function (myPath) {
                    var myPathLocalStorage = JSON.parse(localStorage.getItem('personalPOI'));
                    for (var i = 0; i < myPathLocalStorage.length; i++) {
                        if (myPathLocalStorage[i].id === myPath.id) {
                            myPathLocalStorage[i].POIs.forEach(function (record) {
                                ontology.deleteMyPois(record.id);
                            })
                            $scope.exit();
                            myPathLocalStorage.splice(i, 1);
                        }
                    }
                    if (myPathLocalStorage.length == 0) {
                        localStorage.removeItem('personalPOI');
                    } else
                        localStorage.setItem('personalPOI', JSON.stringify(myPathLocalStorage));
                    $scope.visualizzaListaIMieiPercorsi();
                }

                $scope.editPath = function (path) {
                    console.log("edit")
                };

                var difficoltaPercorso = "";
                $scope.slideChange = function (difficolta) {
                    if (difficolta == 0)
                        difficoltaPercorso = ""
                    else if (difficolta == 1)
                        difficoltaPercorso = "T"
                    else if (difficolta == 2)
                        difficoltaPercorso = "E"
                    else if (difficolta == 3)
                        difficoltaPercorso = "EE"

                    return difficoltaPercorso;
                }

            }])

        .controller('homeCtrl', ['$scope', '$ionicModal', '$http', '$window', '$cordovaGeolocation', '$ionicLoading',
            '$ionicPopup', 'dati', 'Layer', 'shareData', '$rootScope', 'ontology', '$localStorage', 'myPoiss', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
            function ($scope, $ionicModal, $http, $window, $cordovaGeolocation, $ionicLoading,
                    $ionicPopup, dati, Layer, shareData, $rootScope, ontology, $localStorage, myPoiss) {
                dati.setInfo($http, $ionicPopup, $window);
                ontology.spiaggia();
                // ontology.addPoi("storto","sss","aiutoaiutffo",13.907280,40.726950,"asda","fddfdf");

                ontology.vari();
                ontology.hotel();
                //ontology.myPois($localStorage.uid);

                map;
                geosec;
                var view, vectorLayer, layer, feature, geosec, array;
                var poiPersonal, poispiaggia, poigeosec, poivari, poihotel;
                $scope.inNavigazione = 0;
                view = new ol.View({
                    center: ol.proj.fromLonLat([13.905190, 40.722581]),
                    zoom: 12,
                    minZoom: 11,
                    maxZoom: 19
                });
                // Creating the map

                var osm = new ol.layer.Tile({
                    source: new ol.source.OSM()
                });
                var bing = new ol.layer.Tile({
                    source: new ol.source.BingMaps({
                        key: '71rqXKbkWBsxf2MExapX~Ox5OhkC_T_uOnwVVdTvycQ~ApfQiyY8xedZ7IsN8T6QxKTCcIhFP-40NSpOGDXtVm-UifKxHWqC3OuF_d72tc46',
                        imagerySet: 'AerialWithLabels'
                    })
                });

                map = new ol.Map({
                    layers: [osm, bing],
                    target: 'map',
                    controls: ol.control.defaults({
                        zoom: false,
                        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                            collapsible: false
                        })
                    }),
                    view: view
                });

                //visualizza i "poi" dal sito geosec
                $scope.poiGeosec = function () {
                    if (!poigeosec) {
                        poigeosec = Layer.posizionaPunto("1", 'icon/geosec.png');
                        map.addLayer(poigeosec);
                    } else {
                        Layer.viewLayer(poigeosec);
                    }
                    if (poigeosec.getVisible()) {
                        $scope.attivoA = "attivo";
                    } else {
                        $scope.attivoA = "";
                    }
                }

                //visualizza i "poi spiaggia" locali
                $scope.poiSpiaggia = function () {
                    if (!poispiaggia) {
                        poispiaggia = Layer.posizionaPunto(window.myJson[0], 'icon/spiaggia.png');
                        map.addLayer(poispiaggia);
                    } else {
                        Layer.viewLayer(poispiaggia);
                    }
                    if (poispiaggia.getVisible()) {
                        $scope.attivoB = "attivo";
                    } else {
                        $scope.attivoB = "";
                    }
                }

                //visualizza i "poi vari" locali
                $scope.poiVari = function () {
                    if (!poivari) {
                        poivari = Layer.posizionaPunto(window.myJson[1], 'icon/montagna.png');
                        map.addLayer(poivari);
                    } else
                        Layer.viewLayer(poivari);
                    if (poivari.getVisible()) {
                        $scope.attivoC = "attivo";
                    } else {
                        $scope.attivoC = "";
                    }
                }

                //visualizza i "poi hotel" locali
                $scope.poiHotel = function () {
                    if (!poihotel) {
                        poihotel = Layer.posizionaPunto(window.myJson[2], 'icon/hotel.png');
                        map.addLayer(poihotel);
                    } else
                        Layer.viewLayer(poihotel);
                    if (poihotel.getVisible()) {
                        $scope.attivoD = "attivo";
                    } else {
                        $scope.attivoD = "";
                    }
                }

                //visualizza i "poi personali
                $scope.poiPersonali = function () {

                    //ontology.myPois($localStorage.uid)
                    myPoiss.myPois().success(function () {
                        if (poiPersonal == null) {
                            if (window.myJson[3] != null) {
                                poiPersonal = Layer.posizionaPunto(window.myJson[3], 'icon/personali.png');
                                map.addLayer(poiPersonal);
                                if (poiPersonal.getVisible()) {
                                    $scope.attivoE = "attivo";
                                } else {
                                    $scope.attivoE = "";
                                }
                            } else
                            {
                                $ionicPopup.alert({
                                    title: 'SPIACENTE',
                                    template: 'Non hai ancora inserito POI personali!'
                                });
                            }
                        } else
                        {
                            console.log("non entra");
                            Layer.viewLayer(poiPersonal);
                            if (poiPersonal.getVisible()) {
                                $scope.attivoE = "attivo";
                            } else {
                                $scope.attivoE = "";
                            }
                        }
                    }).error(function (error) {

                        console.log("bla bla");
                    })


                }

                //nome della pagina html che viene prodotta nel modal
                $ionicModal.fromTemplateUrl('templates/cercaPercorso.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function (modal) {
                    $scope.modal = modal;
                });

                //Trova le feature mentre si naviga sulla mappa
                map.on('pointermove', function (evt) {
                    if (view.getCenter() != ol.proj.fromLonLat([13.905190, 40.722581])) {
                        document.getElementById('resetPosizione').style.display = "block";
                    }
                    feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                        return feature;
                    })
                });

                //Visualizza informazioni poi
                map.getViewport().addEventListener("click", function (e) {
                    if (feature && feature.get('nom_poi')) {
                        var stringa = "";
                        if (feature.get('src'))
                            stringa += "<br><img  width='100%' height='100%'  src='" + feature.get('src') + "'><br>";
                        if (feature.get('description'))
                            stringa += "<br><b>Descrizione:<br></b>" + feature.get('description');
                        if (feature.get('nom_itiner'))
                            stringa += "<br><b>Nome percorso:<br></b>" + feature.get('percorso') + "<br><b>Nome itinerario:<br></b>" + feature.get('nom_itiner');
                        var createPOIPopup = $ionicPopup.show({
                            title: "<h4>" + feature.get('nom_poi') + "</h2>",
                            content: stringa + "<br><b>Coordinate punto:</b><br>" + feature.get('coordinates'),
                            buttons: [{
                                    text: 'OK',
                                    type: 'button-positive',
                                    onTap: function (e) {
                                    }
                                }]
                        });
                    }
                });

                //apertura del modal
                $scope.openModal = function () {
                    $scope.modal.show();
                };

                $scope.closeModal = function () {
                    $scope.path = shareData.getData();
                    $scope.modal.hide();
                };

                //Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });

                // Execute action on hide modal
                $scope.$on('modal.hidden', function () {
                    // Execute action
                });

                // Execute action on remove modal
                $scope.$on('modal.removed', function () {
                    // Execute action
                });

                //Dedicato allo Swipe della mappa tra i due diversi layer
                var swipe = document.getElementById('swipe');
                bing.on('precompose', function (event) {
                    var ctx = event.context;
                    var width = ctx.canvas.width * (swipe.value / 100);
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
                    ctx.clip();
                });

                bing.on('postcompose', function (event) {
                    var ctx = event.context;
                    ctx.restore();
                });

                swipe.addEventListener('input', function () {
                    map.render();
                }, false);

                //delete all layer
                $scope.exit = function () {
                    document.getElementById('range_Map').style.bottom = "6%";
                    $scope.showLoading = 0;
                    $scope.inNavigazione = 0;
                    shareData.setData(null);
                    $scope.path = shareData.getData();
                    var arrLayer = map.getLayers().getArray();
                    for (var i = map.getLayers().getLength() - 1; i >= 0; i--) {
                        if (arrLayer[i] != osm && arrLayer[i] != bing)
                            map.removeLayer(arrLayer[i]);
                    }
                    poihotel = null;
                    poispiaggia = null;
                    poiPersonal = null;
                    poigeosec = null;
                    poivari = null;
                    $scope.attivoA = '';
                    $scope.attivoB = '';
                    $scope.attivoC = '';
                    $scope.attivoD = '';
                    $scope.attivoE = '';
                }

                $scope.show = function () {
                    //$ionicLoading.show();
                };

                $scope.hide = function () {
                    //$ionicLoading.hide();
                };

                $scope.activeButtonAddPOI = false;
                $scope.addPOI = function () {
                    //informazioni del percorso selezionato
                    var path = shareData.getData();

                    $scope.showError = false;
                    var options = {enableHighAccuracy: true, timeout: 10000};

                    $scope.showLoading = 1;
                    $scope.activeButtonAddPOI = true;
                    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                        $scope.activeButtonAddPOI = false;
                        $scope.showLoading = 0;

                        $scope.newPoi = {
                            coordinates: [position.coords.longitude, position.coords.latitude],
                        }
                        console.log(" " + position.coords.latitude + "  " + position.coords.longitude + " " + $scope.blockGPSExecution)

                        var createPOIPopup = $ionicPopup.show({
                            scope: $scope,
                            title: 'Aggiungi POI',
                            subTitle: 'Inserisci le informazioni',
                            templateUrl: 'templates/addPOI.html',
                            buttons: [{
                                    text: 'Cancel',
                                    type: 'button-positive',
                                    onTap: function (e) {
                                    }
                                }, {
                                    text: '<b>Save</b>',
                                    type: 'button-positive',
                                    attr: 'data-ng-disabled="!newPoi.nom_poi"',
                                    onTap: function (e) {
                                        if (!$scope.newPoi.nom_poi) {
                                            //don't allow the user to close unless he enters wifi password
                                            e.preventDefault();
                                            $scope.submitted = true;

                                            $scope.showError = true;
                                        } else {
                                            //formato del localStorage:
                                            //localstorage[{id,POIs:[{nom_poi,coordinates:[][],...},{nom_poi,coordinates:[][],...}]}]
                                            var allPoiPersonalArray, poi;
                                            var poiArr = new Array();

                                            //array che sarà inserito in localStorage
                                            var idPath = 'personalPOI';//id del local storage
                                            if (!localStorage.getItem(idPath)) {//se localStorage non è definito
                                                allPoiPersonalArray = new Array();
                                                //inserimento di un nuovo percorso e dei POI relativi
                                                var poiTemp = insertPOIPath(path);
                                                allPoiPersonalArray.push(poiTemp);
                                                poi = poiTemp.POIs;
                                                console.log(poi)
                                                // allPoiPersonalArray.push(insertPOIPath(path));
                                            } else {//se localStorage era già definito
                                                allPoiPersonalArray = JSON.parse(localStorage.getItem(idPath));
                                                //flag per verificare se il percorso esisteva gia
                                                var flag = true;
                                                //itero su array esterno del localStorage per vedere se il path è già inserito
                                                allPoiPersonalArray.forEach(function (percorso) {
                                                    if (percorso.id == path.id) {
                                                        //se il path esiste già allora inserisco solo i POI
                                                        var index = percorso.POIs.push(insertPOI(path)) - 1;
                                                        poi = new Array()
                                                        poi.push(percorso.POIs[index]);
                                                        flag = false;
                                                        return;
                                                    }
                                                });
                                                if (flag) {
                                                    //se il path non esiste allora inserisco path + OI
                                                    var poiTemp = insertPOIPath(path);
                                                    allPoiPersonalArray.push(poiTemp);
                                                    poi = poiTemp.POIs;
                                                    console.log(poi)
                                                }
                                            }
                                            //iserisco la nuova variabile modificata
                                            localStorage.setItem(idPath, JSON.stringify(allPoiPersonalArray));

                                            //Visualizza il poi appena inserito
                                            // poiArr.push(poi);
                                            var geosec = Layer.posizionaPunto(poi, 'icon/personali.png');
                                            map.addLayer(geosec);
                                        }
                                        return $scope.newPoi;
                                    }
                                }]
                        });
                        createPOIPopup.then(function (res) {
                            $scope.showError = false;
                        });

                    }, function (error) {
                        $ionicPopup.alert({
                            title: 'Error',
                            template: 'GPS momentaneamente non disponibile'
                        });
                        $scope.showLoading = 0;
                        $scope.activeButtonAddPOI = false;
                    });
                };

                /*funzione di supporto per creare un oggetto POI con le coordinate*/
                function insertPOI(path) {
                    var objPOI = {
                        id: "<http://sws.geonames.org/" + $localStorage.uid + "/" + $localStorage.countPOI + ">",
                        nom_poi: $scope.newPoi.nom_poi,
                        coordinates: $scope.newPoi.coordinates,
                        src: imageSrc,
                        percorso: path.percorso,
                        tipo_perc: path.tipo_perc,
                        cod_tipo: path.cod_tipo,
                        description: $scope.newPoi.description
                    };
                    console.log("ciaone");
                    ontology.addPoi($localStorage.uid, $localStorage.countPOI, objPOI.nom_poi,
                            objPOI.coordinates[1], objPOI.coordinates[0], objPOI.description, objPOI.src);
                    //ricarica poi personali dall'ontologia dopo l'aggiunta di un nuovo punto
                    return objPOI;
                }

                /*funzione di supporto per creare un oggetto con id_Path e con l'array delle coordinate*/
                function insertPOIPath(path) {
                    var poiArray = new Array();
                    var infoPoi = insertPOI(path);
                    poiArray.push(infoPoi);
                    var objPath = {
                        id: path.id,
                        POIs: poiArray
                    }
                    return objPath;
                }

                //geolocalizzazione utente
                var geolocation = new ol.Geolocation({
                    projection: view.getProjection()
                });

                geolocation.setTracking(true);


                var accuracyFeature = new ol.Feature();
                geolocation.on('change:accuracyGeometry', function () {
                    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
                });

                var positionFeature = new ol.Feature();
                positionFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({
                            color: '#3399CC'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#fff',
                            width: 2
                        })
                    })
                }));

                geolocation.on('change:position', function () {
                    var coordinates = geolocation.getPosition();
                    positionFeature.setGeometry(coordinates ?
                            new ol.geom.Point(coordinates) : null);
                });

                new ol.layer.Vector({
                    map: map,
                    source: new ol.source.Vector({
                        features: [accuracyFeature, positionFeature]
                    })
                });

                //Riposiziona la Mappa
                $scope.resetPosizione = function () {
                    view.setCenter(ol.proj.fromLonLat([13.905190, 40.722581]));
                    view.setZoom(12);
                    view.rotate(0);
                    map.setView(view);
                    document.getElementById('resetPosizione').style.display = "none";
                }

                //Gestisce la selezione dei percorsi prima della Navigazione
                $scope.gestisciPercorso = function (scelta) {
                    if (scelta) {
                        $scope.inNavigazione = 1;
                    } else {
                        $scope.openModal();
                        $scope.exit();
                    }
                }

            }])

        .controller('iMieiPercorsiCtrl', ['$scope', '$stateParams',
            function ($scope, $stateParams) {

            }])

        .controller('addPOICtrl', ['$scope', 'Layer', '$cordovaCamera', '$ionicPopup', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
            function ($scope, Layer, $cordovaCamera, $ionicPopup) {
                              imageSrc = null;
                $scope.choosePhoto = function () {
                    var imgRect = document.getElementById("addPoiId").getBoundingClientRect();
                    console.log("rect= " + imgRect.width + " " + imgRect.height + " " + imgRect.bottom + " " + imgRect.left);
                    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
                    var options = setOptionsCamera(srcType, imgRect.width, imgRect.height);

                    $cordovaCamera.getPicture(options).then(function (imageURI) {
                        $scope.imgURI = imageSrc = "data:image/jpeg;base64," + imageURI;
                    }, function (err) {
                        console.log("error createSharedEventCtrl: " + err);
                    });
                }

                $scope.takePhoto = function () {
                    $cordovaCamera.getPicture(setOptionsCamera(Camera.PictureSourceType.CAMERA)).then(function (imageData) {
                        $scope.imgURI = imageSrc = "data:image/jpeg;base64," + imageData;
                    }, function (err) {
                        console.log("error eventInfoCtrl " + err)
                    });
                };
            }])

        .controller('loginCtrl', ['$scope', '$stateParams', '$cordovaOauth', '$state', '$localStorage', '$ionicPopup',
            function ($scope, $stateParams, $cordovaOauth, $state, $localStorage, $ionicPopup) {
                if ($localStorage.uid) {
                    $state.go("home");
                } else {
                    $scope.login = function () {
                        $cordovaOauth.facebook("324449771326573", ["email"]).then(function (result) {
                            var credentials = firebase.auth.FacebookAuthProvider.credential(result.access_token);
                            $localStorage.accessToken = result.access_token;
                            return firebase.auth().signInWithCredential(credentials);
                        }).then(function (firebaseUser) {
                            //memorizza firebaseUser.uid
                            $localStorage.uid = firebaseUser.uid;
                            $localStorage.countPOI = 0;
                            $state.go("home");
                        }).catch(function (error) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Authentication failed'
                            });
                            console.error("Authentication failed:", error);
                        });
                    }
                    /*
                   //Login senza cordova
                     $scope.login = function () {
                     var provider = new firebase.auth.FacebookAuthProvider();
                     firebase.auth().signInWithPopup(provider).then(function (result) {
                     
                     // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                     var token = result.credential.accessToken;
                     
                     // The signed-in user info.
                     var user = result.user;
                     $localStorage.countPOI = 0;
                     $localStorage.uid = result.user.uid;
                     $state.go("home");
                     }).catch(function (error) {
                     // Handle Errors here.
                     var errorCode = error.code;
                     var errorMessage = error.message;
                     // The email of the user's account used.
                     var email = error.email;
                     // The firebase.auth.AuthCredential type that was used.
                     var credential = error.credential;
                     });
                     }*/
                }
            }
        ]);
