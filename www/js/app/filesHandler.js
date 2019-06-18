    var filesHandler = {

        params:null,
        usuarioPath:null,
        estudiosPath:null,
        ultimaMedicionPath:null,
        estudiosMap:null,
        estudiosList:null,
        campaniasMap:null,
        campaniasList:null,
        timeToRefreshInMillis:200,
        self:null,
        ultimaMedicion : null,
        ultimoLoginPath: null,
        unsentPath:null,
        sentPath:null,
        restClient: null,
        artifactCampaignMap: null,
        utils: null,
        guiBuilder: null,
        processOffline: null,
        docService: null,
        inicializar: function(_params)
        {
            self                    = this;
            self.params             = _params;
            self.estudiosMap        = new Map();
            self.estudiosList       = [];
            self.campaniasMap       = new Map();
            self.campaniasList      = [];
            self.ultimoLoginPath    = "_ultimoLogin.json";
            self.artifactCampaignMap= new Map();
            //self.restClient         = new RestClient("http", "app.citymovil.cl/citydata");
            self.restClient         = new RestClient(self.params.config);
            self.processOffline     = true;
            //if(self.params == null ) return;
            self.utils              = self.params.utils;
            self.guiBuilder         = self.params.guiBuilder;
            self.usuarioPath        = self.params.userId + "";
            self.estudiosPath       = self.usuarioPath + "/estudios";
            self.ultimaMedicionPath = self.usuarioPath + "/_ultimaMedicion.json";
            self.miscInfoPath       = self.usuarioPath + "/_miscInfo.json";
            self.unsentPath         = self.usuarioPath + "/unsent";
            self.sentPath           = self.usuarioPath + "/sent";
            self.docService         = new DocService({restClient: self.restClient, estudiosPath: self.estudiosPath, filesHandler: self});


        },
        uniqueID      : function()
        {
            return '_' + Math.random().toString(36).substr(2, 9);
        },
        getEstudiosList  : function()
        {
            return self.estudiosList;
        },
        getEstudiosMap  : function()
        {
            return self.estudiosMap;
        },
        getCampaniasMap     : function()
        {
            return self.campaniasMap;
        },
        getCampaniasList    : function()
        {
            return self.campaniasList;
        },
        getMedicionPath     : function(_campania, _fileName)
        {
            return self.estudiosPath + "/" + _campania.researchId + "/campanias/" + _campania.id + "/" + _fileName;
        },
        getUnsentList:   function()
        {
            return new Promise( (resolve, reject) => {
                console.log("getUnsentList" );
                self.leerArchivos(self.unsentPath, 1)
                .then(function(_myList){
                    console.log("getUnsentList>>>>" + _myList.length);
                    _objectsList = [];
                    if( typeof _myList === "undefined" || !_myList ||  _myList.length === undefined ||  _myList.length < 1 ) return resolve({objectsLits:_objectsList, entriesList:_myList});
                    _counter = 0;
                    for(let _next = 0; _next < _myList.length; _next++)
                    {
                        $.ajax({
                            url:_myList[_next].toURL(), dataType : 'json',async : false,
                            success : function(data){
                                _counter++;
                                _objectsList.push(data);
                                if(_counter  >= _myList.length ) return resolve({objectsLits:_objectsList, entriesList:_myList});
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                _counter++;
                                console.log(JSON.stringify(textStatus));
                                console.log(JSON.stringify(errorThrown));
                                console.log("Status: " + textStatus);
                                if(_counter  >= _myList.length ) return resolve({objectsLits:_objectsList, entriesList:_myList});
                            }
                        });
                    }
                })
            })
        },

        _checkForElementsOffline:   function(_measurement){
            let _allItems = [];
            let _allArrays = _measurement.detail.concat();
            _allArrays.unshift(_measurement.header);
            for(let _next = 0; _next < _allArrays.length; _next++)  _allItems = _allItems.concat(_allArrays[_next]);
            for(let _item = 0; _item < _allItems.length; _item++ ) {
                if( _allItems[_item].type == self.guiBuilder.ELEMENT_MAP && _allItems[_item].isOffline ){
                    console.log("No se Puede Enviar hay elementos Offline");
                    return false;
                }
            }
            return true;
        },
        _processOfflineElements:   function()
        {
            console.log("_processOfflineElements");
            if(!self.processOffline)
            {
                console.log("No podemos entrar. está procesando>>>" + new Date().getTime());
                return;
            }
            console.log("comenzando a procesar>>>" + new Date().getTime());
            self.processOffline = false;
            self.getUnsentList()
            .then(function(_myLists){
                var _myList         =  _myLists.objectsLits;
                var _myEntries      =  _myLists.entriesList;
                let _measurement    = null;
                let _allArrays      = null;
                let _allItems       = null;
                let _offlineItems   = null;
                let _myPromises = [];

                for(let _next = 0; _next < _myList.length; _next++){
                    _myPromises.push(new Promise((resolve, reject) => {
                        _allArrays = _myList[_next].detail.concat();
                        _allArrays.unshift(_myList[_next].header);
                        _allItems = [];
                        _offlineItems = [];
                        for(let _next2 = 0; _next2 < _allArrays.length; _next2++)  _allItems = _allItems.concat(_allArrays[_next2]);
                        for(let _item = 0; _item < _allItems.length; _item++ ){
                             if( _allItems[_item].type != self.guiBuilder.ELEMENT_MAP || ! _allItems[_item].isOffline ) continue;
                             _offlineItems.push( _allItems[_item]);
                         }
                         if(_offlineItems.length < 1 ) resolve(1);
                         else {
                             self.restClient._getCoordinatesFromGmapLink(_offlineItems)
                             .then(_result => {
                                console.log(JSON.stringify( _myList[_next] ));
                                console.log("AHORA A ESCRIBIR!!!");
                                self.escribirArchivo(_myEntries[_next], JSON.stringify(_myList[_next]), false)
                                 .then(  function(_result){console.log(_result); resolve(1);} );
                             });
                         }
                    }));
                }
                return Promise.all(_myPromises);
            })
            .then(_result=>{
                self.processOffline = true;
                console.log("HEMOS TERMINADO LA ITERACION  de MEDICIONES>>>" + new Date().getTime());
            })
        },
        sendToServer    :   function()
        {
            console.log("sendToServer>>>>");
            //return;
            self.getUnsentList()
            .then(function(_myLists){
                let _response = null;
                var _myList =  _myLists.objectsLits;
                var _myEntries =  _myLists.entriesList;
                console.log("Iterando Entries>>>>");
                let _continue = null;
                for(let _next = 0; _next < _myList.length; _next++)
                {
                    if( _myList[_next].sent != null || !self._checkForElementsOffline( _myList[_next] ) )continue;
                    console.log("Vamos a Enviar una medicion>>>" + _myEntries[_next].name);
                    _myList[_next].sent = self.utils.getUtcIsoDateTime();
                    self.restClient.post("dataCollector/save", _myList[_next])
                    .then((_response)=>{
                        if(_response && _response.id > 0)
                        {
                             //_myList[_next].sent = self.utils.getFechaActual() + " " + self.getHoraActual();
                             console.log(JSON.stringify(_myList[_next]));
                             self.escribirArchivo(_myEntries[_next], JSON.stringify(_myList[_next]), false)
                             .then(  function(_result){
                                 return new Promise( (resolve, reject) => {
                                            self.createDirAndReturnEntry(self.sentPath)
                                            .then(_dirEntry=>{
                                                //TODO
                                                 console.log("Moviendo....>>>");
                                                 _myEntries[_next].moveTo( _dirEntry,
                                                                 null,
                                                                 function(_result){console.log("OK>>>>moveTo>>>>" + _result); resolve(1);},
                                                                 function(_error){console.log("Error>>>>MoveTo>>>>" + _error.code); resolve(-1);});
                                            })
                                        })
                             },
                             function(_error){
                                 console.log("Error escribiendo en medicion>>>>" + _result + ">>>>>" + _error ); reject(0);
                             })
                        }

                    })
                }
            });


        },
        doLogout:           function()
        {
            return new Promise( (resolve, reject) => {
                self.getUltimoLogin()
                    .then(_info=>{
                        _info.fin = new Date();
                        resolve(self.writeFileAsJson(self.ultimoLoginPath, _info));
                    },
                    function(_error){
                        console.log( "Error " + _error);resolve(-3);
                    })
            });
        },
        grabarUltimoLogin:  function(_data)
        {
            //console.log("grabarUltimoLogin");
            //console.log(_data);
            return new Promise( (resolve, reject) => {
                let _info = {userId : _data.userId, inicio:new Date(), fin: null, username:_data.username};
                resolve(self.writeFileAsJson(self.ultimoLoginPath, _info));
            });
        },
        comenzarMedicion    : function(_campania, _cabeceraElements)
        {
            console.log("comenzarMedicion");
            return new Promise( (resolve, reject) => {
                let _nombreMedicion = self.uniqueID() + ".json";
                let _medicion={ id:_nombreMedicion,  path: self.getMedicionPath(_campania, _nombreMedicion), userId: self.params.userId,
                                //init: self.utils.getCurrentDate() + " " + self.utils.getCurrentHour() , end: null, deleted:false, sent:null, campaignId: _campania.id,
                                init: self.utils.getUtcIsoDateTime(), end: null, deleted:false, sent:null, campaignId: _campania.id, inicioLocale: self.utils.getCurrentDate() + " " + self.utils.getCurrentHour(),
                                researchId:_campania.researchId , header:_cabeceraElements,  detail:[]};
                console.log("cbefore Medicion");
                self.grabarMedicion(_medicion)
                .then(function(_result){resolve(_medicion)});
            })
        },
        finishMeasurement   : function(_measurement){
            return new Promise( (resolve, reject) => {
                self.grabarMedicion(_measurement)
                .then(function(_result){
                    return  self.createDirAndReturnEntry(self.unsentPath)
                            .then(function(_dirEntry){
                                return new Promise( (resolve, reject) => {
                                    self.crearArchivo(_measurement.path, false)
                                    .then(function(_fileEntry){
                                        return new Promise( (resolve, reject) => {
                                            _fileEntry.copyTo( _dirEntry,
                                                            _measurement.id,
                                                            function(_result){console.log("OK>>>>finishMeasurement>>>>copyTo>>>>" + _result); resolve(1);},
                                                            function(_error){console.log("Error>>>>finishMeasurement>>>>copyTo>>>>" + _error.code); resolve(-1);});
                                        })
                                    })
                                    .then(function(_result){
                                        if(_result == 1 )
                                        {
                                            let _newElement = {};
                                            _newElement.id          = _measurement.id;
                                            _newElement.campaignId  = _measurement.campaignId;
                                            _newElement.researchId  = _measurement.researchId;
                                            _newElement.init        = _measurement.init;
                                            _newElement.end         = _measurement.end;
                                            _newElement.userId      = _measurement.userId;
                                            _newElement.deleted     = _measurement.deleted;
                                            _newElement.sent        = null;
                                            _newElement.header      = [];
                                            _newElement.detail      = [];
                                            let _newElements = [];
                                            if(_measurement.header && _measurement.header.length > 0)
                                            {
                                                for(let next = 0; next < _measurement.header.length; next++)
                                                    _newElements.push(getInfoToSend(_measurement.header[next]));
                                                    //_newElements.push({id:_measurement.header[next].id, label:_measurement.header[next].label, value: _measurement.header[next].userValue, defaultValue: (_measurement.header[next].defaultValue) ? _measurement.header[next].defaultValue : null });
                                            }
                                            _newElement.header = _newElements;
                                            _newElements = [];
                                            console.log(JSON.stringify(_measurement.detail));
                                            console.log(_measurement.detail.length);
                                            let _elementWithValue = null;
                                            if(_measurement.detail && _measurement.detail.length > 0)
                                            {
                                                for(let next = 0; next < _measurement.detail.length; next++)
                                                {
                                                    if(!_measurement.detail[next]) continue;
                                                    _newElements[next] = [];
                                                    for (let next2 in _measurement.detail[next]) {
                                                        _elementWithValue = null;
                                                        if(_measurement.detail[next][next2].type == self.guiBuilder.ELEMENT_LIST)
                                                        {
                                                            let _lisElement = {};
                                                            _lisElement.id          = _measurement.detail[next][next2].id;
                                                            _lisElement.type        = _measurement.detail[next][next2].type;
                                                            _lisElement.label       = _measurement.detail[next][next2].label;
                                                            _lisElement.optionName  = _measurement.detail[next][next2].optionName;
                                                            _lisElement.optionId    = _measurement.detail[next][next2].optionId;
                                                            _lisElement.element = getValidFromList(_measurement.detail[next][next2].element);
                                                            _newElements[next].push(_lisElement);
                                                            continue;
                                                        }
                                                        _newElements[next].push(getInfoToSend(_measurement.detail[next][next2]));
                                                    }
                                                }
                                            }
                                            _newElement.detail = _newElements;
                                            console.log("Dir Already Exist");
                                            let _filePath = self.unsentPath + "/" + _measurement.id ;
                                            resolve(self.writeFileAsJson(_filePath, _newElement));
                                            /*
                                            self.crearArchivo(_filePath, false)
                                            .then(  function(_result){
                                                        self.escribirArchivo(_result, JSON.stringify(_newElement), false)
                                                        .then(  function(_result){console.log("grabado>>>>" + _filePath); resolve(1);},
                                                                function(_error){console.log("No grabado>>>>" + _filePath + ">>>>>" + _error ); resolve(0);});
                                                    },
                                                    function(_error){console.log( "File Not Created>>>" + _error); resolve(-1);})
                                            */
                                        }
                                        else resolve(_result);
                                    })
                                })
                            })
                            .then(function(_result){
                                return resolve(_result);
                            })
                })
            })

            function getValidFromList(_elements)
            {
                if(!_elements) return null;
                let _newElements = [];
                let _alreadyButton = false;
                for(let _next = 0; _next < _elements.length; _next++ )
                {
                    if(!_elements[_next].userValue || (_elements[_next].type == _me.ELEMENT_BUTTON && _alreadyButton) ) continue;
                    if(_elements[_next].type == _me.ELEMENT_BUTTON) _alreadyButton = true;
                    _newElements.push(getInfoToSend(_elements[_next]));
                }
                return _newElements;
            }
            function getInfoToSend(_element)
            {
                let _newEle = {id:_element.id, type: _element.type, label: _element.label, value: _element.userValue, defaultValue: (_element.defaultValue) ? _element.defaultValue : null };
                if( _element.isOffline ) _newEle.isOffline = _element.isOffline;
                return _newEle;
            }
        },
        grabarMedicion: function(_medicion)
        {
            return new Promise( (resolve, reject) => {
                console.log("Grabando mediciÃ³n>>>>" + _medicion.id);
                self.writeFileAsJson(_medicion.path, _medicion )
                    .then(_result=>{
                        self.writeFileAsJson(self.ultimaMedicionPath, _medicion )
                        .then(_result =>{
                            return Promise.resolve(_medicion);
                        })
                    })
                    .then(function(_result){
                        console.log("comenzamos medicion OK!");
                        console.log(_result);
                        resolve(_medicion);
                    })
                    .catch(function (error) {
                        console.log("No se pudo crear el archivo de mediciÃ³n>>>" + error);
                        reject(-1);
                    })
            })
        },
        procesarCampanias: function(_estudio)
        {
            console.log("procesarCampanias");
            return new Promise( (resolve, reject) => {
                let myVar = 0;
                let _path = self.estudiosPath + "/" + _estudio.id + "/campanias";
                console.log(_path);
                self.setCampanias(_path)
                .then(function(_result){console.log("Procesar Campanias OK"); resolve(1);})
            })
        },
        crearArchivo : function(_path, _create = true)
        {
            console.log("crearArchivo>>>" + _path);
            return new Promise( (resolve, reject) => {
                    window.requestFileSystem(
                    LocalFileSystem.PERSISTENT, 0,
                    function(fileSystem){ fileSystem.root.getFile(_path, {create: _create},
                                                                function(fileEntry){console.log("file created>>>>" + _path);resolve(fileEntry);},
                                                                function(){console.log("file not created>>>>>"  + _path );resolve(0);});
                }, function(){ console.log("Error creando archivo");console.log(evt.target.error.code);resolve(-1);});
            });
        },
        leerArchivos :   function(_path, _type = 0)
        {
            console.log("leerArchivos");
            return new Promise( (resolve, reject) => {
            //let _ok = false;
            let myMap = new Map();
            window.requestFileSystem(
                LocalFileSystem.PERSISTENT, 0,
                function(fileSystem){
                    fileSystem.root.getDirectory(_path, { create: true },
                                                function(dirEntry){

                                                    let directoryReader = dirEntry.createReader();
                                                    console.log("directoryReader>>>>>");
                                                    console.log(directoryReader);
                                                    directoryReader.readEntries(function(entries){
                                                                                    console.log("Reading entries......" + entries.length);
                                                                                    console.dir(entries);

                                                                                    let _counter = 0;
                                                                                    if(_type == 0 )//mapa de compaÃ±ias o estudios
                                                                                    {
                                                                                        myMap.clear();
                                                                                        for (var i=0; i<entries.length; i++) {
                                                                                            _counter++;
                                                                                            if(!entries[i].isDirectory ) continue;
                                                                                            myMap.set(entries[i].name, entries[i].toURL() + entries[i].name + ".json");
                                                                                        }
                                                                                        resolve(myMap);
                                                                                    }
                                                                                    else if(_type == 1 ) //lista de files entries
                                                                                    {
                                                                                        let _myEntries = [];
                                                                                        for (var i=0; i<entries.length; i++) {
                                                                                            _counter++;
                                                                                            if(entries[i].isDirectory ) continue;
                                                                                            _myEntries.push(entries[i]);
                                                                                        }
                                                                                        resolve(_myEntries);
                                                                                    }
                                                                                },
                                                                                function(_error){ console.log("Failed to list directory contents: ", _error);resolve(true);});
                                                },
                                                function(_error){console.log("dirEntry2>>>>>");console.log(_error.code);resolve(true);});
                },
                function(){console.log(evt.target.error.code);});
            });

        },
        escribirArchivo : function(fileEntry, dataObj, isAppend)
        {
            console.log("escribirArchivo");
            return new Promise( (resolve, reject) => {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function() {
                        resolve(1);
                        console.log("Successful file read...");
                        };
                    fileWriter.onerror = function (e) {
                        console.log("Failed file read: " + e.toString());
                        resolve(-1);
                    };
                    if (isAppend) {// If we are appending data to file, go to the end of the file.
                        try {fileWriter.seek(fileWriter.length);}
                        catch (e) {console.log("file doesn't exist!");}
                    }
                    fileWriter.write(dataObj);

                });
            });

        },
        createDirAndReturnEntry : function(_path, _create = true)
        {
            console.log("createDirAndReturnEntry>>>" + _path);
            console.log("_Create???>>>" + _create);
            return new Promise( (resolve, reject) => {
                window.requestFileSystem(
                    LocalFileSystem.PERSISTENT, 0,
                    function(fileSystem){
                        fileSystem.root.getDirectory(_path, { create: _create }, function(dirEntry){console.log("folder created>>>" + _path) ;resolve(dirEntry);
                    },
                    function(){
                        console.log("folder not created>>>>" + _path);resolve(0);});
                    },
                    function(){
                        console.log("Error creating a folder");console.log(evt.target.error.code);resolve(-1);
                });
            });
        },

        crearDir : function(_path, _create = true)
        {
            console.log("crearDir>>>" + _path);
            console.log("_Create???>>>" + _create);
            return new Promise( (resolve, reject) => {
                window.requestFileSystem(
                    LocalFileSystem.PERSISTENT, 0,
                    function(fileSystem){
                        fileSystem.root.getDirectory(_path, { create: _create }, function(dirEntry){console.log("folder created>>>" + _path) ;resolve(1);
                    },
                    function(){
                        console.log("folder not created>>>>" + _path);resolve(0);});
                    },
                    function(){
                        console.log("Error creating a folder");console.log(evt.target.error.code);resolve(-1);
                });
            });
        },
        setEstudios     : function()
        {
            return new Promise( (resolve, reject) => {

                self.estudiosMap.clear();
                self.estudiosList = [];
                self.leerArchivos(self.estudiosPath)
                .then(function(_myMap){
                    return new Promise( (resolve, reject) =>{
                        console.log("Saliendo de setEstudipos");
                        if( typeof _myMap != 'object'  || _myMap == null || _myMap.size < 1 )
                        {
                            console.log("Saliendo de setEstudipos2");
                            resolve(-1);
                        }

                        let _counter = 0;
                        for (const [key, value] of _myMap.entries()){
                            $.ajax({
                                url:value, dataType : 'json',async : false,
                                success : function(data){
                                    console.log("Reading File");
                                    _counter++;
                                    //self.estudiosMap.set(key, {path:value, data:data});
                                    self.estudiosMap.set(key, data);
                                    self.estudiosList.push(data);
                                    if(_counter  >= _myMap.size ) resolve(1);
                                },
                                error: function(XMLHttpRequest, textStatus, errorThrown) {
                                    _counter++
                                    console.log("Status: " + textStatus);
                                    //alert("Error: " + errorThrown);
                                    if(_counter  >= _myMap.size ) resolve(1);
                                }
                            });
                        }
                    })
                })
                .then(function(){
                    console.log("setEstudios OKKK");
                    console.log(self.estudiosMap.size);
                    resolve(1)
                })
            })
        },
        setCampanias     : function(_path)
        {
            console.log("setCampanias");
            return new Promise( (resolve, reject) => {
                console.log("Entrando a setCampanias" + _path);
                self.campaniasMap.clear();
                self.campaniasList = [];
                let _ok = false;
                self.leerArchivos(_path)
                .then(function(_myMap){
                    return new Promise( (resolve, reject) =>{
                        if( typeof _myMap != 'object'  || _myMap == null || _myMap.size < 1 ) {resolve(1); return;};
                        let _counter = 0;
                        for (const [key, value] of _myMap.entries()){
                            console.log("VALUE:::");
                            console.log(value);
                            $.ajax({
                                url:value, dataType : 'json',async : false,
                                success : function(data){
                                    _counter++;
                                    if(data.artifact != null)
                                    {
                                        self.campaniasMap.set(key, data);
                                        self.campaniasList.push(data);
                                    }
                                    if(_counter  >= _myMap.size ) resolve(1);
                                },
                                error: function(XMLHttpRequest, textStatus, errorThrown) {
                                    _counter++;
                                    console.log(JSON.stringify(textStatus));
                                    console.log(JSON.stringify(errorThrown));
                                    console.log("Status: " + textStatus);
                                    //alert("Error: " + errorThrown);
                                    if(_counter  >= _myMap.size ) resolve(1);
                                }
                            });
                        }
                    })
                })
                .then(function(){
                    console.log("setCampanias OKKK");
                    resolve(1)
                })
            })
        },
        doLogin:    function(_params)
        {
            console.log("doLogin");
            return new Promise( (resolve, reject) => {
                let _body = {};
                _body.username = _params.username;
                _body.password = _params.password;
                self.restClient.post("login",_body)
                .then((_response) =>{
                    console.log(JSON.stringify(_response));
                    resolve(_response.response);
                })
            });

        },
        obtenerArtifacts : function(){
            console.log("obtenerArtifacts");
            return new Promise( (resolve, reject) =>{
                self.docService.getArtifacts()
                .then(_result=>{
                    console.log("Fin>>>>obtenerArtifacts");
                    resolve(1);

                });
            });
        },
        obtenerCampanias : function()
        {
            console.log("obtenerCampanias");
            return new Promise( (resolve, reject) =>{
                self.docService.getCampaigns()
                .then(_result=>{
                    console.log("Fin>>>>obtenerCampanias");
                    resolve(1);

                });
            });
        },
        obtenerEstudios : function(){
            console.log("obtenerEstudios");
            return new Promise( (resolve, reject) =>{
                self.docService.getResearchs()
                .then(_result=>{
                    console.log("Fin>>>>obtenerEstudios");
                    resolve(1);
                });
            });
        },
        crearEstructura: function(_dirPath)
        {
            console.log("creando directorios");
            return new Promise( (resolve, reject) =>{
                let _ok = false;
                self.crearDir(_dirPath, false)
                .then(function(_result){
                    return new Promise( (resolve, reject) =>{
                        if(_result == 1){
                            console.log("Already Exist>>>>" + _dirPath);
                            resolve(1);
                        }
                        else if(_result == 0){
                            console.log("Does not Exist>>>>" + _dirPath);
                            self.crearDir(_dirPath)
                            .then(  function(_result){
                                        self.crearDir(self.estudiosPath  )
                                        .then(  function(_result){console.log("result OK>>" + _result); resolve(1);},
                                                function(_result){console.log("Error Not OK>>" + _result);  resolve(-1);
                                        })
                                    },
                                    function(_error){
                                        console.log("Error>>>>>" + _error);
                                        resolve(-1);})
                            .then(function(_result){
                                self.crearDir(self.unsentPath)
                                .then(  function(_result){
                                    console.log("self.unsentPath>>>>>" + _result);
                                    resolve(1);
                                 })
                            })
                            .then(function(_result){
                                self.crearDir(self.sentPath)
                                .then(  function(_result){
                                    console.log("self.sentPath>>>>>" + _result);
                                    resolve(1);
                                 })
                            })
                        }
                    })
                })
                .then(function(_result){
                    resolve(1)
                })
            });
        },
        saveFile:   function(_path, _content, _override = false )
        {
            return new Promise( (resolve, reject) =>{
                self.fileExists(_path)
                .then((_exist)=>{
                    if(!_exist ){
                        console.log("Creando archivo>>>>" + _path);
                        self.crearArchivo(_path)
                        .then((_fileEntry)=>{
                            console.log("escribiendo archivo>>>>" + _path);
                            return new Promise((resolve, reject) => {
                                self.escribirArchivo(_fileEntry, JSON.stringify(_content), false)
                                .then(function(_result){
                                    console.log("resolve archivo>>>>" + _path);
                                    resolve(_result)
                                })
                            })
                        })
                        .then(_result=>{
                            resolve(_result);
                        })
                    }
                    else{
                        if(_override ){
                            self.crearArchivo(_path)
                            .then(_fileEntry =>{
                                    if(typeof _fileEntry != 'object' ) resolve(-1);
                                    else{
                                        return new Promise((resolve, reject) => {
                                            self.escribirArchivo(_fileEntry, JSON.stringify(_content), false)
                                            .then((_result) =>{resolve(_result)});
                                        })
                                    }
                            })
                            .then(_result=>{
                                resolve(_result);
                            })
                        }
                        //else resove(-2)
                        else reject(1);
                    }
                })
            })
        },
        saveDir:    function(_path)
        {
            return new Promise( (resolve, reject) =>{
                self.dirExists(_path)
                .then((_exist)=>{
                    if(!_exist){
                        self.crearDir(_path)
                        .then(function(_result){
                            console.log("_result>>>>" + _result);
                            if(_result == 1 ) resolve(1);
                            else reject(_result)

                        },function(_error){
                            reject(_error)
                        });
                        //return Promise.reject(-2);
                    }
                    else resolve(1);
                })
            })
        },
        dirExists:  function(_path)
        {
            console.log("dirExists>>>>" + _path);
            return new Promise( (resolve, reject) =>{
                self.crearDir(_path, false)
                .then( (_result) =>{
                        console.log("Resturn>>>" + _result);
                         if(_result == 1) resolve(true);
                         else resolve(false);
                     })
            })

        },
        fileExists: function(_path)
        {
            console.log("FileExists>>>>" + _path);
            return new Promise( (resolve, reject) =>{
                self.crearArchivo(_path, false)
                .then( (_result) =>{
                    console.log("Resturn>>>" + _result);
                    console.log(typeof _result);
                    if(typeof _result == 'object' ) resolve(true);
                    else resolve(false);
                })
            })
        },
        synchronize:    function(){
            if( !self.utils.hasConnection() )
            {
                return new Promise( (resolve, reject) => {
                        self.setEstudios()
                        .then(function(_result){
                            resolve(1);
                            })
                        });
            }
            console.log("synchronize!!!");
            self.sendToServer();
            return new Promise( (resolve, reject) => {
                    self.crearEstructura(self.usuarioPath)
                    .then(self.obtenerEstudios)
                    .then(self.obtenerCampanias)
                    .then(self.obtenerArtifacts)
                    .then(self.setEstudios)
                    .then(function(_result){
                        console.log("guardando última sincronizacion!!!")
                        filesHandler.setLastSynchronization(new Date());
                        return resolve(1);
                    })
            });
        },
        setLastSynchronization: function(_date)
        {
            console.log("setLastSynchronization");
            return new Promise( (resolve, reject) => {
                self.getMiscInfo()
                    .then(_info=>{
                        _info.synchronize.timestamp = _date.getTime();
                        resolve(self.writeFileAsJson(self.miscInfoPath, _info));
                    },
                    function(_error){
                        console.log( "Error " + _error);resolve(-3);
                    })
            });
        },
        getMiscInfo: function()
        {
            console.log("getMiscInfo");
            return Promise.resolve(
                self.fileExists(self.miscInfoPath)
                    .then(_result => {
                        if( _result ) return self.readFileAsJson(self.miscInfoPath);
                        console.log("getMiscInfo2");
                        let _data = {synchronize:{timestamp:null}};
                        return Promise.resolve(_data);
                    })
            );
        },
        getUltimoLogin    : function()
        {console.log("getUltimoLogin");
            return Promise.resolve(self.fileExists(self.ultimoLoginPath)
                .then(_result => {
                    if( _result ) return self.readFileAsJson(self.ultimoLoginPath);
                    console.log("getUltimoLogin2");
                    let _data = {userId : null, inicio:null, fin: null, username:null};
                    return Promise.resolve(_data);
                    //return new Promise( (resolve, reject) => {resolve(_data)});
                })
            );
        },
        getUltimaMedicion    : function()
        {
            return self.readFileAsJson(self.ultimaMedicionPath);
        },
        writeFileAsJson:    function(_filePath, _content){
            return new Promise( (resolve, reject) => {
                self.crearArchivo(_filePath, true)
                    .then(_result=>{
                        self.escribirArchivo(_result, JSON.stringify(_content), false)
                            .then(  function(_result){console.log("writeFileAsJson grabado>>>>>" + _result); resolve(1);},
                                    function(_error){console.log("writeFileAsJson Error>>>>" + _result + ">>>>>" + _error ); resolve(-1);})
                        },
                        function(_error){
                            console.log( "Error " + _error);resolve(-2)
                        })
            })
            .catch(err => {
                console.log('failed ', err); // { error: 'url missing in async task 2' }
                return Promise.reject();
            });
        },
        readFileAsJson: function(_filePath){
            let _fileAsJson = null;
            return new Promise( (resolve, reject) => {
                self.crearArchivo(_filePath, false)
                .then(  function(_fileEntry){
                            return new Promise( (resolve, reject) => {
                            console.log("_fileEntry>>>>" + _fileEntry);
                            if(!_fileEntry) { resolve(0); }
                            console.log("_fileEntry.toURL()>>>>>" + _fileEntry.toURL());
                            $.ajax({
                                url:_fileEntry.toURL(), dataType : 'json',async : false,
                                success : function(data){_fileAsJson = data; return resolve(1)},
                                error: function(XMLHttpRequest, textStatus, errorThrown) {console.log("Status: " + textStatus); resolve(0)}
                            });
                        })
                })
                .then(function(_result){
                    console.log("_fileAsJson>>>>>" + _fileAsJson);
                    console.log("_result>>><"  + _result);
                    console.log(typeof _fileAsJson);
                    return resolve(_fileAsJson);
                })
            });
        }
    };
