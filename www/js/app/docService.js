
    class DocService {
        constructor(_params) {
            this.restClient = _params.restClient;
            this.researchsPath = _params.estudiosPath;
            this.artifactCampaignMap = new Map();
            this.filesHandler   = _params.filesHandler;
        }

        getResearchs(){
            console.log("getResearchs");
            let _this = this;
            return new Promise( (resolve, reject) => {
                console.log("getResearchs2");
                _this.restClient.get("research/getAll")
                .then((_response) =>{
                    console.log("getResearchs3");
                     if(_response.id > 0) return _response.response;
                     return null;
                })
                .then(_data =>{ return _storeResearchs(_data, _this.researchsPath, _this.filesHandler )})
                .then(function(_result){
                    console.log("Saliendo del for"); console.log(_result);
                    //return 1;
                    resolve(1);
                })
                .catch(function(error){
                    console.log("error FETCHING>>>>>>>>");
                    console.log(error);
                });
            });
            function _storeResearchs(_data, _storeDir, _filesHandler){
                console.log("_storeReaearchs");
                 //_data = [];
                 //_data.push( {"id": 1000,"name": "Valles del Bio-Bio","description": "Valles del Bio-Bio"});

                let _myPromises = [];
                if( !_data ) return Promise.all(_myPromises);
                let _ok = 0;
                for(let next = 0; next < _data.length; next++)
                {
                    console.log("_storeReaearchs Itrando...." + _data[next].id);
                    _myPromises.push(new Promise((resolve, reject) => {
                    _filesHandler.dirExists(_storeDir + "/" + _data[next].id)
                        .then(_dirExists =>{
                            return new Promise((resolve, reject) => {
                                if(_dirExists){
                                    console.log("Dir Existe>>>" + _storeDir + "/" + _data[next].id);
                                    let _filePath = _storeDir + "/" + _data[next].id + "/" + _data[next].id + ".json";
                                    _filesHandler.fileExists(_filePath)
                                    .then(_fileExists=>{
                                        if(!_fileExists) resolve(_filesHandler.writeFileAsJson(_filePath, _data[next]));
                                        else {console.log("Ya existe, no hacemos nada"); resolve(1);}
                                    })
                                }
                                else{
                                    console.log("Dir NO Existe>>>" + _storeDir + "/" + _data[next].id);
                                    _filesHandler.crearDir(_storeDir + "/" + _data[next].id)
                                    .then(  function(_result){
                                        let _filePath = _storeDir + "/" + _data[next].id + "/" + _data[next].id + ".json";
                                        _filesHandler.writeFileAsJson(_filePath, _data[next])
                                        .then(_result=>{
                                            console.log("write FILE result>>>" + _result)
                                            resolve(_result);
                                        })
                                    })
                                    .catch(function (error) {
                                        console.log("ERROR>>>" + error);
                                        resolve(-1);
                                    });
                                }
                            });
                        })
                        .then(_result=>{
                            console.log("_storeReaearchs resulkt2>>" + _result); return resolve(1);
                        })
                    }));
                }

                console.log("return _storeReaearchs");
                return Promise.all(_myPromises);
            }
        }

        getCampaigns(){
            //return Promise.reject(-1);
            let _this = this;
            _this.artifactCampaignMap.clear();
            return new Promise( (resolve, reject) => {
                _this.restClient.get("campaign/getAll")
                .then((_response) =>{
                    if(_response.id > 0) return _response.response;
                    return null;
                })
                //.then(_crearCampanias)
                .then(_data =>{ return _storeCampaigns(_data, _this.researchsPath, _this.artifactCampaignMap, _this.filesHandler )})
                .then(function(_result){
                    console.log("Saliendo del for comapnias>>>>" + _result);
                    resolve(1);
                })
                .catch(function(error){
                    console.log("error FETCHING>>>>>>>>");
                    console.log(error);
                });
            });

            function _storeCampaigns(_data, _storeDir, artifactsMap, _filesHandler ){
                // console.log("_storeCampaigns");
                // _data = [];
                // _data.push({"id": 1001,"researchId": 1000,"artifactId": 1002,"name": "ORIGEN-DESTINO VEHÍCULOS"});

                let _myPromises = [];
                if( !_data ) return Promise.all(_myPromises);
                //let _filePath = null;
                //let _dirname = null;
                for(let next = 0; next < _data.length; next++){
                    console.log("_storeCampaigns Iterandp " + _data[next].artifactId);
                    _myPromises.push(new Promise((resolve, reject) => {
                        if(! artifactsMap.get(_data[next].artifactId)  ){
                            console.log("No existe en mapa. Lo agregamos....");
                            artifactsMap.set(_data[next].artifactId, []);
                        }
                        console.log("_dirname....>>>" + _storeDir + "/" + _data[next].researchId);
                        _filesHandler.dirExists(_storeDir + "/" + _data[next].researchId)
                        .then(_exist=>{
                            return new Promise((resolve, reject) => {
                                console.log("Dir Existe>>>" + _storeDir + "/" + _data[next].researchId);
                                if(!_exist){
                                    console.log("NO EXISTE ESTUDIO!!>>>" + _storeDir + "/" + _data[next].researchId);
                                    console.log("CHAO!!>>>");
                                    resolve(-2);
                                }
                                else{
                                    console.log("Dir Existe>>>" + _storeDir + "/" + _data[next].researchId);
                                    let _dirname = _storeDir + "/" + _data[next].researchId + "/campanias";
                                    console.log("_dirname2....>>>" + _dirname);
                                    _filesHandler.saveDir(_dirname)
                                    .then(_result=>{
                                         let _dirname = _storeDir + "/" + _data[next].researchId + "/campanias" + "/" + _data[next].id;
                                         console.log("_dirname3....>>>" + _dirname);
                                         return new Promise((resolve, reject) => {
                                             _filesHandler.saveDir(_dirname)
                                             .then(_result=>{
                                                 //resolve(_result);
                                                 return new Promise((resolve, reject) => {
                                                     let  _filePath = _storeDir + "/" + _data[next].researchId + "/campanias" + "/" + _data[next].id + "/" + _data[next].id + ".json";
                                                      console.log("_filePath....>>>" + _filePath);
                                                     _data[next].pathInDevice = _filePath;
                                                     _filesHandler.saveFile(_filePath, _data[next])
                                                     .then(_result=>{
                                                         console.log("Archivo guardado");
                                                         resolve(1);
                                                     },function(_error){
                                                         console.log("Retornando -1.....");resolve(-1);
                                                     })
                                                     .catch(function(error){
                                                         console.log("error>>>>>>>>");
                                                         console.log(error);
                                                         resolve(-2);
                                                     });
                                                 })
                                             })
                                             .then(function(_result) {console.log("Diciendo TRUE");  resolve(1);})
                                             .catch(function (error) {console.log("2-Error>>>>" + error);console.log(error.message);resolve(-1);});
                                        });
                                    })
                                    .then(_result=>{
                                        console.log("Saliendo de guardar compañia");
                                        artifactsMap.get(_data[next].artifactId).push(_data[next]);
                                        resolve(1);
                                    })
                                }
                            });
                        })
                        .then(_result=>{
                            console.log("_storeCampaigns resulkt3>>" + _result); return resolve(1);
                        })
                    }));
                }
                console.log("return _storeCampaigns");
                return Promise.all(_myPromises);
            }
        }

        getArtifacts(){
            //return;
            console.log("getArtifacts");
            let _this = this;
            return new Promise( (resolve, reject) => {
                _this.restClient.get("artifact/getAll")
                .then((_response) =>{
                    if(_response.id > 0) return _response.response;
                    return null;

                })
                //.then(_data =>{ return _storeArtifacts(_data, this.artifactCampaignMap)})
                .then(_data =>{ return _storeArtifacts(_data, _this.artifactCampaignMap, _this.filesHandler)})
                .then(function(_result){
                    console.log("Saliendo del for artifacts>>>>" + _result);
                    resolve(1);
                })
                .catch(function(error){
                    console.log("error FETCHING>>>>>>>>");
                    console.log(error);
                });
            });
           function _storeArtifacts(_data, artifactsMap, _filesHandler){
               console.log("crearArtifacts");
                //_data = [];
//                _data.push({"id":1002,"type":"artifact","name":"Origen-Destino Vehículos.","description":"versión 1.0","kind":{"id":1,"name":"counter"},"releaseDate":"2019-05-28T00:00:00.000Z","updatedDate":"2019-05-28T00:00:00.000Z","header":{"pages":[{"id":"page_h01","type":"page","required":true,"editable":false,"content":[{"id":"comp_h01","type":"selection","label":"Supervisor","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"code":"S01","name":"Felipe Sanhueza"},{"id":2,"code":"S02","name":"Javiera Olguín"},{"id":3,"code":"S03","name":"Claudio Pavez"}]},{"id":"comp_h02","type":"selection","label":"Punto","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","childrenComponent":["comp_h03"],"option":[{"id":1,"name":"Ruta O-50: Peaje Huinanco"},{"id":2,"name":"Ruta O-50: Peaje Puentes Negros"},{"id":3,"name":"Autopista del Itata: Peaje Agua Amarilla"},{"id":4,"name":"Ruta 148: Entre Agua de la Gloria y Florida"},{"id":5,"name":"Camino de la Madera: Peaje San Roque"}]},{"id":"comp_h03","type":"selection","label":"Dirección","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","childrenComponent":["comp_b01"],"parentComponent":"comp_h02","option":[],"optionsByParent":[{"parentId":1,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]},{"parentId":2,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Cholguán"}]},{"parentId":3,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]},{"parentId":4,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]},{"parentId":5,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]}]},{"id":"comp_h04","type":"optionsWithImages","label":"Acceso","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","unanswerOption":{"id":-1,"label":"NO RESPONDE"},"option":[{"id":1,"label":"Alternativa A","header":["- Tipo de ruta:  Calzada Simple C/berma","- Distancia viaje: 120 km","- Tiempo de Viaje: 1:20","- Costo Peajes: Gratis"],"img":"a1.png"},{"id":2,"label":"Alternativa B","header":["- Tipo de ruta:  Autopista","- Distancia viaje: 120 km","- Tiempo de Viaje: 1 Hora","- Costo Peajes: $2500"],"img":"a2.png"}]}]}]},"body":{"pages":[{"id":"page_b01","type":"page","required":true,"editable":false,"content":[{"id":"comp_b01","type":"selection","label":"Tipo Vehículo","required":true,"defaultValue":0,"radioButton":true,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"AUTO"},{"id":2,"name":"CAMIONETA"},{"id":3,"name":"FURGÓN"}]},{"id":"comp_b02","type":"map","label":"Origen Viaje","required":true,"defaultValue":0,"editable":true,"visible":true,"placeHolder":""},{"id":"comp_b03","type":"selection","label":"región Origen","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"I de Tarapacá"},{"id":2,"name":"II de Antofagasta"},{"id":3,"name":"III de Atacama"},{"id":4,"name":"IV de Coquimbo"},{"id":5,"name":"V de Valparaíso"},{"id":6,"name":"VI del Libertador General Bernardo O’Higgins"},{"id":7,"name":"VII del Maule"},{"id":8,"name":"VIII de Concepción"},{"id":9,"name":"IX de la Araucanía"},{"id":10,"name":"X de Los Lagos"},{"id":11,"name":"XI de Aysén del General Carlos Ibañez del Campo"},{"id":12,"name":"XII de Magallanes y de la Antártica Chilena"},{"id":13,"name":"XIII Metropolitana de Santiago"},{"id":14,"name":"XIV de Los Ríos"},{"id":15,"name":"XV de Arica y Parinacota"},{"id":16,"name":"XVI del Ñuble"}]},{"id":"comp_b04","type":"map","label":"Destino Viaje","required":true,"defaultValue":0,"editable":true,"visible":true,"placeHolder":"","startCoordinates":"-36.89129925059164, -72.39874335292905","searchboxSouthWestCoordinates":"-38.14172033149424, -73.92034979824155","searchboxNorthEastCoordinates":" -35.65577015348177, -70.41021796230405","searchboxStrictBounds":false},{"id":"comp_b05","type":"selection","label":"región Destino","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"I de Tarapacá"},{"id":2,"name":"II de Antofagasta"},{"id":3,"name":"III de Atacama"},{"id":4,"name":"IV de Coquimbo"},{"id":5,"name":"V de Valparaíso"},{"id":6,"name":"VI del Libertador General Bernardo O’Higgins"},{"id":7,"name":"VII del Maule"},{"id":8,"name":"VIII de Concepción"},{"id":9,"name":"IX de la Araucanía"},{"id":10,"name":"X de Los Lagos"},{"id":11,"name":"XI de Aysén del General Carlos Ibañez del Campo"},{"id":12,"name":"XII de Magallanes y de la Antártica Chilena"},{"id":13,"name":"XIII Metropolitana de Santiago"},{"id":14,"name":"XIV de Los Ríos"},{"id":15,"name":"XV de Arica y Parinacota"},{"id":16,"name":"XVI del Ñuble"}]},{"id":"comp_b06","type":"number","label":"Nº Pasajeros (Chofer Incluido)","required":true,"defaultValue":0,"editable":true,"visible":true},{"id":"comp_b07","type":"selection","label":"Porpósito viaje","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"Trabajo"},{"id":2,"name":"Estudio"},{"id":3,"name":"Trámites"},{"id":4,"name":"Turismo"},{"id":5,"name":"Otro"}]},{"id":"comp_b08","type":"selection","label":"Ingreso Familiar","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"Menos de $150.000"},{"id":2,"name":"Entre $250.001 y 500.000"},{"id":3,"name":"Entre $500.001 y 750.000"},{"id":4,"name":"Entre $750.001 y 1.000.000"},{"id":5,"name":"Entre $1.00.001 y 1.250.000"},{"id":6,"name":"Mayor de $1.500.001"},{"id":7,"name":"Sin Ingresos"},{"id":8,"name":"No contesta"}]},{"id":"comp_b09","type":"button","label":"Guardar","required":true,"editable":false,"visible":true,"action":"count","postAction":"reset"}]}]}});
//_data.push({"id":1002,"type":"artifact","name":"Origen-Destino Vehículos.","description":"versión 1.0","kind":{"id":1,"name":"counter"},"releaseDate":"2019-05-28T00:00:00.000Z","updatedDate":"2019-05-28T00:00:00.000Z","header":{"pages":[{"id":"page_h01","type":"page","required":true,"editable":false,"content":[{"id":"comp_h01","type":"selection","label":"Supervisor","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"code":"S01","name":"Felipe Sanhueza"},{"id":2,"code":"S02","name":"Javiera Olguín"},{"id":3,"code":"S03","name":"Claudio Pavez"}]},{"id":"comp_h02","type":"selection","label":"Punto","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","childrenComponent":["comp_h03"],"option":[{"id":1,"name":"Ruta O-50: Peaje Huinanco"},{"id":2,"name":"Ruta O-50: Peaje Puentes Negros"},{"id":3,"name":"Autopista del Itata: Peaje Agua Amarilla"},{"id":4,"name":"Ruta 148: Entre Agua de la Gloria y Florida"},{"id":5,"name":"Camino de la Madera: Peaje San Roque"}]},{"id":"comp_h03","type":"selection","label":"Dirección","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","childrenComponent":["comp_b01"],"parentComponent":"comp_h02","option":[],"optionsByParent":[{"parentId":1,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]},{"parentId":2,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Cholguán"}]},{"parentId":3,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]},{"parentId":4,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]},{"parentId":5,"options":[{"id":1,"name":"Hacia Ruta 5"},{"id":2,"name":"Hacia Concepción"}]}]},{"id":"comp_h04","type":"optionsWithImages","label":"Acceso","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","unanswerOption":{"id":-1,"label":"NO RESPONDE"},"option":[{"id":1,"label":"Alternativa A","header":["- Distancia viaje: 120 km", "- Distancia viaje: 120 km","- Distancia viaje: 120 km","- Tiempo de Viaje: 1:20","- Costo Peajes: Gratis"],"img":"a1.png"},{"id":2,"label":"Alternativa B","header":["- Tipo de ruta:  Autopista","- Distancia viaje: 120 km","- Tiempo de Viaje: 1 Hora", "", ""],"img":"a2.png"}]}]}]},"body":{"pages":[{"id":"page_b01","type":"page","required":true,"editable":false,"content":[{"id":"comp_b01","type":"selection","label":"Tipo Vehículo","required":true,"defaultValue":0,"radioButton":true,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"AUTO"},{"id":2,"name":"CAMIONETA"},{"id":3,"name":"FURGÓN"}]},{"id":"comp_b02","type":"map","label":"Origen Viaje","required":true,"defaultValue":0,"editable":true,"visible":true,"placeHolder":""},{"id":"comp_b03","type":"selection","label":"región Origen","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"I de Tarapacá"},{"id":2,"name":"II de Antofagasta"},{"id":3,"name":"III de Atacama"},{"id":4,"name":"IV de Coquimbo"},{"id":5,"name":"V de Valparaíso"},{"id":6,"name":"VI del Libertador General Bernardo O’Higgins"},{"id":7,"name":"VII del Maule"},{"id":8,"name":"VIII de Concepción"},{"id":9,"name":"IX de la Araucanía"},{"id":10,"name":"X de Los Lagos"},{"id":11,"name":"XI de Aysén del General Carlos Ibañez del Campo"},{"id":12,"name":"XII de Magallanes y de la Antártica Chilena"},{"id":13,"name":"XIII Metropolitana de Santiago"},{"id":14,"name":"XIV de Los Ríos"},{"id":15,"name":"XV de Arica y Parinacota"},{"id":16,"name":"XVI del Ñuble"}]},{"id":"comp_b04","type":"map","label":"Destino Viaje","required":true,"defaultValue":0,"editable":true,"visible":true,"placeHolder":"","startCoordinates":"-36.89129925059164, -72.39874335292905","searchboxSouthWestCoordinates":"-38.14172033149424, -73.92034979824155","searchboxNorthEastCoordinates":" -35.65577015348177, -70.41021796230405","searchboxStrictBounds":false},{"id":"comp_b05","type":"selection","label":"región Destino","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"I de Tarapacá"},{"id":2,"name":"II de Antofagasta"},{"id":3,"name":"III de Atacama"},{"id":4,"name":"IV de Coquimbo"},{"id":5,"name":"V de Valparaíso"},{"id":6,"name":"VI del Libertador General Bernardo O’Higgins"},{"id":7,"name":"VII del Maule"},{"id":8,"name":"VIII de Concepción"},{"id":9,"name":"IX de la Araucanía"},{"id":10,"name":"X de Los Lagos"},{"id":11,"name":"XI de Aysén del General Carlos Ibañez del Campo"},{"id":12,"name":"XII de Magallanes y de la Antártica Chilena"},{"id":13,"name":"XIII Metropolitana de Santiago"},{"id":14,"name":"XIV de Los Ríos"},{"id":15,"name":"XV de Arica y Parinacota"},{"id":16,"name":"XVI del Ñuble"}]},{"id":"comp_b06","type":"number","label":"Nº Pasajeros (Chofer Incluido)","required":true,"defaultValue":0,"editable":true,"visible":true},{"id":"comp_b07","type":"selection","label":"Porpósito viaje","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"Trabajo"},{"id":2,"name":"Estudio"},{"id":3,"name":"Trámites"},{"id":4,"name":"Turismo"},{"id":5,"name":"Otro"}]},{"id":"comp_b08","type":"selection","label":"Ingreso Familiar","required":true,"defaultValue":0,"editable":true,"visible":true,"multipleChoice":false,"placeHolder":"Seleccione","option":[{"id":1,"name":"Menos de $150.000"},{"id":2,"name":"Entre $250.001 y 500.000"},{"id":3,"name":"Entre $500.001 y 750.000"},{"id":4,"name":"Entre $750.001 y 1.000.000"},{"id":5,"name":"Entre $1.00.001 y 1.250.000"},{"id":6,"name":"Mayor de $1.500.001"},{"id":7,"name":"Sin Ingresos"},{"id":8,"name":"No contesta"}]},{"id":"comp_b09","type":"button","label":"Guardar","required":true,"editable":false,"visible":true,"action":"count","postAction":"reset"}]}]}});

               let _myPromises = [];
               if( !_data ) return Promise.all(_myPromises);
               for(let next = 0; next < _data.length; next++){
                   console.log("_storeArtifacts Iterandp " + _data[next].id);
                   _myPromises.push(new Promise((resolve, reject) => {
                        let _campaigns = (artifactsMap.get(_data[next].id)) ? artifactsMap.get(_data[next].id) : null;
                        console.log("JSON.stringify(_campaigns)");
                        console.log(JSON.stringify(_campaigns));
                        _storeArtifact(_campaigns, _data[next], _filesHandler)
                        .then(_result=>{
                            resolve(_result);
                        })
                   }));
               }
               console.log("return _storeArtifacts");
               return Promise.all(_myPromises);
            }
            function _storeArtifact(_campaigns, _artifact, _filesHandler){
                console.log("_storeArtifact");
                let _myPromises = [];
                if( !_campaigns || _campaigns.length < 1 ) return Promise.all(_myPromises);
                for(let _next = 0; _next < _campaigns.length; _next++){
                    console.log("_storeArtifact iterando....");
                    _myPromises.push(new Promise((resolve, reject) => {
                        if(! _campaigns[_next].artifact)
                        {
                            console.log("_storeArtifact 3");
                             //return new Promise((resolve, reject) => {
                                 console.log("_storeArtifact 4");
                                _campaigns[_next].artifact = _artifact;
                                _filesHandler.saveFile(_campaigns[_next].pathInDevice, _campaigns[_next], true)
                                .then(function(_result){
                                     console.log("Retornando 1.....");resolve(1);
                                },function(_error){
                                    console.log("Retornando -1.....");resolve(-1);
                                })
                                .catch(function(error){
                                    console.log("error>>>>>>>>");
                                    console.log(error);
                                    resolve(-2);
                                });
                            //});
                        }
                        else resolve(-1 );
                    }));
                }
                console.log("return _storeArtifact");
                return Promise.all(_myPromises);
            }
        }

    }
