//var _map = null;
var mainApp = {
    // Application Constructor
    userId: 1000,
    username: "MyUsername",
    campaniasMap: null,
    campaniasList: null,
    estudiosMap: null,
    estudiosList: null,
    currentEstudio: null,
    _me: null,
    elementsMap: null,
    currentCampania: null,
    contadorMap: null,
    divElementsMap: null,
    currentMedicion: null,
    END_MEASUREMENT_ACTION      : "end",
    START_MEASUREMENT_ACTION    : "start",
    DELETE_MEASUREMENT_ACTION   : "delete",
    SHOW_MAP_ACTION             : "showMap",
    SHOW_IMG_ACTION             : "showImage",
    SHOW_OPTIONS_WITH_IMAGES_ACTION : "showOptionsWithImages",
    COUNT_BUTTON_ACTION         : "count",
    CAMPAIGN_SECTION_DETAIL     : "detail",
    CAMPAIGN_SECTION_HEADER     : "header",
    RESET_ACTION                : "reset",
    utils                       : null,
    guiBuilder                  : null,
    lastRecord                  : null,
    mapObj                      : null,
    markerMap                   : null,
    ENCUESTA_METRO              : 101,
    CONFIG                      : null,
    initialize: function () {
         _me = this;
         _me.guiBuilder = new GuiBuilder();
         _me.utils = new Utils();
         console.log("INITIALE");
         _me.utils.getJsonfileAsObject("js/app/config.json")
         .then(_result =>{
             _me.CONFIG = _result;
             setInterval(function(){ _me.utils.setPosition(); _me.checkConnection();filesHandler._processOfflineElements(); _me.guiBuilder.menu();}, 30000);
             setInterval(function(){ filesHandler.sendToServer()}, 90000);
             //setInterval(function(){ _me.utils.setPosition(); _me.checkConnection(); _me.guiBuilder.menu();}, 30000);
             document.addEventListener('deviceready', _me.onDeviceReady.bind(this), false);
             document.addEventListener("backbutton", _me.onBackKeyDown, false);
            $("#botonLogin").on("click", function(){_me.login();});
            $(".version").text(_me.CONFIG.VERSION);
         })

    },
    inicializaLogin: function()
    {
        //filesHandler.inicializar(null);
        console.log("inicializaLogin....");
        filesHandler.getUltimoLogin()
        .then(function(_ultimoLogin){
        console.log("inicializaLogin....1");
        console.log(_ultimoLogin);
            if(_ultimoLogin == null || _ultimoLogin.fin != null || _ultimoLogin.userId == null ){
                _me.guiBuilder.hidePopupModal();
                $("#pag_login").show();

                    return;
                }
            _me.userId = _ultimoLogin.userId;
            _me.username = _ultimoLogin.username;
            _me.procesarUsuarioLogueado();
        })
    },
    procesarUsuarioLogueado:    function()
    {
        $(".username").text(_me.username);
        _params = {};
        _params.config = _me.CONFIG;
        _params.userId = _me.userId;
        _params.utils = _me.utils;
        _params.guiBuilder = _me.guiBuilder;
        filesHandler.inicializar(_params);
        filesHandler.synchronize()
            .then(function(_return){
                console.log("procesarUsuarioLogueado...");
                console.log(_return);
                return new Promise( (resolve, reject) => {
                    filesHandler.getUltimaMedicion()
                        .then(function(_ultimaMedicion){
                            if( typeof _ultimaMedicion != 'object' || _ultimaMedicion == null || _ultimaMedicion.end != null  || _ultimaMedicion.deleted ){resolve(1);return;}
                            _me.currentEstudio = filesHandler.getEstudiosMap().get(_ultimaMedicion.researchId + "");
                            filesHandler.procesarCampanias(_me.currentEstudio)
                                .then(function(_result) {
                                    _me.currentCampania = filesHandler.getCampaniasMap().get(_ultimaMedicion.campaignId + "");
                                    _me.currentMedicion = _ultimaMedicion;
                                    _me.resumeMeasurement(_me.currentMedicion);
                                    _me.guiBuilder.hidePopupModal();
                                    reject(-1)
                                })
                        })
                })
            })
            .then(  function(_return){//console.log("Comenzamos>>>>" + _return);
                    _me.guiBuilder.hidePopupModal();
                    _me.buildEstudios()
                },
                function(_error){console.log("Rechazado>>> " + _error );
                })

    },
    resumeMeasurement:  function(_measurement)
    {
        //console.log("resumeMeasurement");
        //console.log(_me.currentCampania.artifact.body.pages[0].content.length);
        //console.log(JSON.stringify(_me.currentCampania.artifact.body.pages[0].content[_me.currentCampania.artifact.body.pages[0].content.length - 1]));
        _me.resetFormElements();
        let _containerDivName   = "medicionDetailContainer";
        let _elements           = (_measurement.summary != null && _measurement.summary.elements != null ) ? _measurement.summary.elements : _me.currentCampania.artifact.body.pages[0].content;
        let _pageDivName        = "pag_medicionDetail";
        let _html = "";
        $("#" + _containerDivName).empty();
        _me.divElementsMap.set(_containerDivName, []);
        $(".campaniaTitle").html(_me.currentCampania.name);

        if(!_elements) return;
        for(let next = 0; next < _elements.length; next++)
        {
            _me.elementsMap.set(_elements[next].id, _elements[next]);
            _html += _me.guiBuilder.buildResume(_elements[next], _measurement, _containerDivName);
        }
        _html += _me.guiBuilder.buildEndMeasurementButton();
        _html += _me.guiBuilder.buildDeleteMeasurementButton();
        _html +=  _me.guiBuilder.getLastRecordArea();
        $("#" + _containerDivName).html(_html);
        _me.guiBuilder.initAutocompleteElements();
        $.mobile.changePage("#" + _pageDivName, { transition: "slide" });
        $('#' + _containerDivName).trigger('create');
        if( _measurement.summary && _measurement.summary.lastRecord) _me.guiBuilder.showLastRecordArea(_measurement.summary.lastRecord);
        else _me.guiBuilder.showLastRecordArea(null);

    },

    login: function()
    {
        _me.guiBuilder.showPopupModal();
        let username = $("#username").val().trim();
		let password = $("#password").val().trim();
        _params = {};
        _params.username = username;
        _params.password = password;
        filesHandler.doLogin(_params)
        .then(_response=>{
            if(!_response.username)
            {
                if(!_me.utils.hasConnection()){
                    _me.checkConnection();
                    _me.guiBuilder.hidePopupModal();
                    return;
                }
                _me.guiBuilder.hidePopupModal();
                _me.guiBuilder.showInfoMessage("Credenciales erróneas", document.getElementById('myLoginContent') );
                return;
            }
            _params.userId  = _response.username;
            _me.userId      = _params.userId;
            _me.username    = _response.username;
            filesHandler.inicializar({config: _me.CONFIG});
            filesHandler.grabarUltimoLogin(_params)
            .then(  _result => {
                    _me.procesarUsuarioLogueado();
            })

        })
    },
    buildEstudios: function()
    {
        _me.guiBuilder.buildResearchsList();
    },
    buildCampanias: function()
    {
        _me.guiBuilder.buildCampaignesList();
    },
    resetFormElements:  function()
    {
        _me.elementsMap = new Map();
        _me.contadorMap = {};
        _me.divElementsMap = new Map();
        _me.guiBuilder.hideLastRecordArea();
        _me.guiBuilder.resetAutoCompleteMapElements();
    },
    buildCampaign : function(_section)
    {
        if(!_me.currentCampania) return;
        _me.resetFormElements();
        if(_me.currentCampania.artifact == null || _me.currentCampania.artifact.kind == null) return;

        let _html = "";
        let _elements = null;
        let _containerDivName    = null;
        let _pageDivName    = null;
        let _staticHtmlElements = "";
        if(_section == _me.CAMPAIGN_SECTION_HEADER)
        {
            $("#medicionDetailContainer").empty();
            _containerDivName = "medicionHeaderContainer";
            _elements = _me.currentCampania.artifact.header.pages[0].content;
            _pageDivName = "pag_medicionHeader";
            _staticHtmlElements += _me.guiBuilder.buildStartMeasurementButton();
            let _elementProperties = {id:10091, label:"Buscar", type:"map"};
            //_elements.unshift(_elementProperties);
        }
        else if( _section == _me.CAMPAIGN_SECTION_DETAIL )
        {
            $("#medicionHeaderContainer").empty();
            _containerDivName = "medicionDetailContainer";
            _elements = _me.currentCampania.artifact.body.pages[0].content;
            _pageDivName = "pag_medicionDetail";

            _staticHtmlElements += _me.guiBuilder.buildEndMeasurementButton();
            _staticHtmlElements += _me.guiBuilder.buildDeleteMeasurementButton();
            _staticHtmlElements += _me.guiBuilder.getLastRecordArea();
        }
        $("#" + _containerDivName).empty();
        _me.divElementsMap.set(_containerDivName, []);
        $(".campaniaTitle").html(_me.currentCampania.name);
        if(!_elements) return;
        let _element = null;
        for(let next = 0; next < _elements.length; next++)
        {
            _element = _elements[next];
            _me.elementsMap.set(_element.id, _element);
            _html += _me.guiBuilder.buildElement(_element, _containerDivName);
        }
        //console.log(_staticHtmlElements);
        _html += _staticHtmlElements;
        console.log("_html");
        console.log(_html);
        $("#" + _containerDivName).html(_html);
        _me.guiBuilder.initAutocompleteElements();
        //console.log("_me.guiBuilder.getAutocompleteMapElements()");
        //console.log(_me.guiBuilder.getAutocompleteMapElements);

        $.mobile.changePage("#" + _pageDivName, { transition: "slide" });
        $('#' + _containerDivName).trigger('create');
        _me.guiBuilder.hidePopupModal();
    },
    startMeasurement:   function(_button)
    {
        if(!_me.validarCamposRequeridos(_button)){_button.disabled=false;return;}
        _button.disabled=true;
        _me.contadorMap = {};
        _me.guiBuilder.showPopupModal();
        filesHandler.comenzarMedicion(_me.currentCampania, _me.divElementsMap.get(_button.parentElement.id))
        .then(  function(_medicion){
                    _me.currentMedicion = _medicion;
                    _me.buildCampaign( _me.CAMPAIGN_SECTION_DETAIL);
                    _me.guiBuilder.hidePopupModal();
                },
                function(_error){
                    _me.guiBuilder.hidePopupModal();
                    console.log('Error comenzando  medicion>>>>' + _error  );
                })
    },
    finishMeasurement:   function(_button, _measurement)
    {
        return new Promise( (resolve, reject) => {
            filesHandler._processOfflineElements();
            let _inicio     = _measurement.inicioLocale;
            let _fin        = _me.utils.getCurrentDate() + " " + _me.utils.getCurrentHour();
            //let _fin        = _me.utils.getUtcIsoDateTime();
            let _registros  = (_measurement.detail && _measurement.detail.length ) ? _measurement.detail.length : 0;
            let _summary = '';
            _summary += '<label for="Inicio">¿Desea finalizar la medición?</label>';
            _summary += '<div class="ui-field-contain"><label for="Inicio">Inicio:</label><label id="Inicio"><b>' + _inicio + '</b></label></div>';
            _summary += '<div class="ui-field-contain"><label for="fin">Fin:</label><label id="fin"><b>' + _fin + '</b></label></div>';
            _summary += '<div class="ui-field-contain"><label for="reg">Nº Registros:</label><label id="reg"><b>' + _registros + '</b></label></div>';
            var html = _me.guiBuilder.getConfirmationPopup("Medición", _summary);
            _me.utils.forceClosePopup();
            $("#" + _button.parentElement.id).append(html).find("#mypDialog").enhanceWithin().popup({
                afterclose: function (event, ui) {
                    $("#mypDialog").remove();
                }
            }).popup("open", {
                transition: "flow",
                positionTo: "window"
            });
            $("#mypDialog").on("click", "#btnPopOK", function(){
                _me.guiBuilder.showPopupModal();
                _measurement.end    =  _me.utils.getUtcIsoDateTime();
                filesHandler.finishMeasurement(_measurement)
                .then(function(_result){
                    filesHandler.synchronize();
                    resolve(1);
                })
                .then(function(_result){
                    //console.log("close Popup");
                    $("#mypDialog").popup("close");
                    _measurement = null;
                    resolve(1);
                })
            });
            // $("#mypDialog").on("click", "#btnPopOK", function(){
            //     _me.guiBuilder.showPopupModal();
            //     _measurement.end    =  _me.utils.getUtcIsoDateTime();
            //     filesHandler.finishMeasurement(_measurement);
            //     .then(function(_result){
            //         filesHandler.synchronize();
            //         resolve(1);
            //     })
            //     .then(function(_result){
            //         //console.log("close Popup");
            //         $("#mypDialog").popup("close");
            //         _measurement = null;
            //         resolve(1);
            //     })
            // });
        })
    },
    deleteMeasurement   : function(_button, _measurement)
    {
        return new Promise( (resolve, reject) => {
            var html = _me.guiBuilder.getConfirmationPopup('Medición', '<h3 class="ui-title">¿Desea eliminar la medición?</h3>');
            _me.utils.forceClosePopup();
            $("#" + _button.parentElement.id).append(html).find("#mypDialog").enhanceWithin().popup({
                afterclose: function (event, ui) {
                    $("#mypDialog").remove();
                }
            }).popup("open", {
                transition: "flow",
                positionTo: "window"
            });
            $("#mypDialog").on("click", "#btnPopOK", function(){
                _me.guiBuilder.showPopupModal();
                _measurement.end        = _me.utils.getUtcIsoDateTime();
                _measurement.deleted    = true;
                filesHandler.finishMeasurement(_measurement)
                .then(function(_result){
                    //filesHandler.sendToServer();
                    filesHandler.synchronize();
                    resolve(1);
                })
                .then(function(_result){
                    $("#mypDialog").popup("close");
                    _measurement = null;
                    resolve(1);
                })
            });
        })
    },
    showMap    : function(_button, _elementProperties){
        _me.guiBuilder.buildMapPopup(_elementProperties);
        try{$("#map_popup").popup("close");_me.guiBuilder.hidePopupModal();}catch(err){console.log(err.message);}
        setTimeout(function(){$('#map_popup').trigger("create");$("#map_popup").popup("open", { transition: "slideup"   });}, 300);

    },
    showImage    : function(_button, _elementProperties){
        //alert("Show Image");
        _me.guiBuilder.buildImagePopup(_elementProperties);
        try{$("#image_popup").popup("close");_me.guiBuilder.hidePopupModal();}catch(err){console.log(err.message);}
        setTimeout(function(){$('#image_popup').trigger("create");$("#image_popup").popup("open", { transition: "slideup"   });}, 300);
    },
    showOpotionsWithImages    : function(_button, _elementProperties){
        //alert("Show Image Option");
        _me.guiBuilder.buildOptionsWithImagesPopup(_elementProperties);
        try{$("#optionsWithImagesPopup").popup("close");_me.guiBuilder.hidePopupModal();}catch(err){console.log(err.message);}
        screen.orientation.lock('landscape-secondary');
        setTimeout(function(){$('#optionsWithImagesPopup').trigger("create");$("#optionsWithImagesPopup").popup("open", { transition: "slideup"   });}, 500);
    },
    BORRAMEENCAPSULAME :function(_optionId, _optionLabel, _textId, _allOptionsIds){
        console.log("BORRAMEENCAPSULAME");
         for(let _next = 0 ; _next < _allOptionsIds.length; _next++ )
         {
             $("#optWithImg_header_" + _allOptionsIds[_next]).css("background-color","#eee");
             $("#optWithImg_img_" + _allOptionsIds[_next]).css("background-color","#eee");
         }
        $("#optWithImg_header_" + _optionId).css("background-color","#3385ff");
        $("#optWithImg_img_" + _optionId).css("background-color","#3385ff");
        $("#optionsWithImagesAccept").attr("optionWitImgSelectedId", _optionId);
        $("#optionsWithImagesAccept").attr("optionWitImgSelectedLabel", _optionLabel);
        $("#optionsWithImagesAccept").focus();
        //alert($("#optionsWithImagesAccept").attr("optionWitImgSelectedId"));
        //alert($("#optionsWithImagesAccept").attr("optionWitImgSelectedLabel"));


        //$("#" + _textId).val(_optionLabel);
        //screen.orientation.lock('portrait-primary');
        //$('#optionsWithImagesPopup').popup("close");
    },
    clickOnButton       : function(_elementProperties, _button)
    {
        let _accion = _elementProperties.action;
        if ( _accion == _me.START_MEASUREMENT_ACTION )              _me.startMeasurement(_button);
        else if ( _accion == _me.COUNT_BUTTON_ACTION)               _me.contar(_button);
        else if ( _accion == _me.END_MEASUREMENT_ACTION )   {       _me.finishMeasurement(_button, _me.currentMedicion).then(function(){_me.buildCampanias()})}
        else if ( _accion == _me.DELETE_MEASUREMENT_ACTION ){       _me.deleteMeasurement(_button, _me.currentMedicion).then(function(){_me.buildCampanias()})}
        else if ( _accion == _me.SHOW_MAP_ACTION )                  _me.showMap(_button, _elementProperties);
        else if ( _accion == _me.SHOW_IMG_ACTION )                  _me.showImage(_button, _elementProperties);
        else if ( _accion == _me.SHOW_OPTIONS_WITH_IMAGES_ACTION )  _me.showOpotionsWithImages(_button, _elementProperties);
    },

    tapHoldOnButton :   function(_elementProperties, _button)
    {
        let _accion = _elementProperties.action;
        _me.utils.forceClosePopup();
        if ( _accion != _me.COUNT_BUTTON_ACTION) return;
        $("#mypDialog").remove();
        if(!_me.validarCamposRequeridos(_button))return;
        var html = _me.guiBuilder.getCounterPopup()
        $("#" + _button.parentElement.id).append(html);
        $("#" + _button.parentElement.id).find("#mypDialog").enhanceWithin().popup({
            afterclose: function (event, ui) {
                $("#mypDialog").remove();
            }
        }).popup("open", {
            transition: "flow",
            positionTo: "window"
        });
        $("#mypDialog").on("click", "#btnPopOK", function(){
            let _numberValue = parseInt($("#spin").val());
            $("#mypDialog").popup("close");
            _me.contar(_button, _numberValue);
        });
    },
    getElementValue:   function(_myElement)
    {
        return _me.guiBuilder.getElementValue(_myElement);
    },
    validarCamposRequeridos: function(_btnElement)
    {
        _me.lastRecord = [];
        if(!_me.divElementsMap.get(_btnElement.parentElement.id)) return false;
        let _myElements = _me.divElementsMap.get(_btnElement.parentElement.id);
        let _myMessage = "Por favor, complete los campos requeridos (*)";
        _me.lastRecord.push({key:"Último Registro", value: _me.utils.getCurrentDate() + " " + _me.utils.getCurrentHour()});
        let _elementValue = null;
        let _lastRecordValue = null;
        for(let next = 0; next < _myElements.length; next++)
        {
            let jqElement = $("#" + _myElements[next].id);
            if( _myElements[next].visible !== undefined &&
                !_myElements[next].visible && !$(jqElement).is(':visible')) continue;
            if( _myElements[next].type == _me.guiBuilder.ELEMENT_LIST || _btnElement.id == _myElements[next].id ) continue;

            _myElements[next].userValue = null;
            _elementValue = _me.getElementValue(_myElements[next]);
            console.log("validarCamposRequeridos");
            console.log(_myElements[next].id);
            console.log(JSON.stringify(_elementValue));
            if(!_myElements[next].required || !jqElement )
            {
                if( !jqElement ) continue;
                _myElements[next].userValue = _elementValue;
                _lastRecordValue = {key:_myElements[next].label, value: _myElements[next].userValue.text};
                if( (!_lastRecordValue.value || _lastRecordValue.value == "") && _myElements[next].tmpTextValue != undefined ) _lastRecordValue.value = _myElements[next].tmpTextValue;
                _me.lastRecord.push(_lastRecordValue);
                continue;
            }
            //if((_elementValue.id == null && _elementValue.text == null && !Array.isArray( _elementValue ) ) || ( Array.isArray( _elementValue ) && _elementValue.length < 1 ))
            if((_elementValue.id == null && _elementValue.text == null && !Array.isArray( _elementValue ) ) || ( Array.isArray( _elementValue.id ) && _elementValue.id.length < 1 ))
            {
                console.log("_myElements[next].id");
                console.log(_myElements[next].id);
                _myMessage += (_myElements[next].label === undefined || !_myElements[next].label ) ? "" : ": " + _myElements[next].label;
                _me.guiBuilder.showInfoMessage(_myMessage, _btnElement.parentElement );
                return false;
            }
            _myElements[next].userValue = _elementValue;
            _lastRecordValue = {key:_myElements[next].label, value: _myElements[next].userValue.text};
            if( (!_lastRecordValue.value || _lastRecordValue.value == "") && _myElements[next].tmpTextValue != undefined ) _lastRecordValue.value = _myElements[next].tmpTextValue;
            _me.lastRecord.push(_lastRecordValue);
        }
        return true;
    },
    contar:   function(_button, _numberValue = 1)
    {
        if(_numberValue == 0 ) return;
        if(!_me.validarCamposRequeridos(_button)) return;
        if(!_me.contadorMap[_button.id]) _me.contadorMap[_button.id] = {contador:0, textoBoton:_button.innerHTML};
        let _myCounter = _me.contadorMap[_button.id];
        if(_numberValue < 0 && Math.abs(_numberValue) > _myCounter.contador )  _numberValue = _myCounter.contador * -1;
        _myCounter.contador +=_numberValue;
        _button.innerHTML = _myCounter.textoBoton + " (" + _myCounter.contador + ")";
        var _myElem = _me.elementsMap.get(_button.id);
        var _divId = _button.parentElement.id;
        //console.log("IDELEMENT>>>>>>" + _myElem.id);

        let _myElements = _me.divElementsMap.get(_divId);
        _myElem.userValue    = _numberValue;
        let mewArray = jQuery.extend(true, {}, _me.divElementsMap.get(_divId));
        if(_myElem.postAction && _myElem.postAction == _me.RESET_ACTION )
        {
            try{
                $('._RadioButton').prop('checked', false);
                $('._RadioButton').checkboxradio("refresh");
            }catch(err){
                console.log(err.message);
            }
            console.log("RESET!!!!!");
            for(let next = 0; next < _myElements.length; next++)
            {

                if( _myElements[next].type ==_me.guiBuilder.ELEMENT_SELECTION ){
                    if(!_myElements[next].option || _myElements[next].option.length < 1 ){
                        $('#' + _myElements[next].id).empty();
                        $('#' + _myElements[next].id).append('<option value="-1"></option>');
                        if(  _myElements[next].showOnlyWithOptions)
                            $("#fld_" + _myElements[next].id ).hide();
                    }
                }

                try{$('#' + _myElements[next].id).val('').selectmenu('refresh', true);}catch(err){console.log(err.message);}
                if(_myElements[next].type ==_me.guiBuilder.ELEMENT_GROUPING_SELECTORS)
                {
                    let _groupingContentId = "groupingContent_" + _myElements[next].id;;
                    try{$('#' +_groupingContentId).html("");}catch(err){console.log(err.message);}
                }
            }
        }

        clearUserValues(_myElements);
        function clearUserValues(_myElements)
        {
            if(!_myElements || !_myElements.length ) return;
            for(let next = 0; next < _myElements.length; next++)
            {
                console.log("clearUserValues");
                try{_myElements[next].tmpValues = null;}catch(err){console.log(err.message);}
                console.log("0");
                try{_myElements[next].tmpTextValue = null;}catch(err){console.log(err.message);}
                console.log("1");
                try{_myElements[next].userValue = null;}catch(err){console.log(err.message);}
                console.log("2");
                if(_myElements[next].type ==_me.guiBuilder.ELEMENT_LIST)
                {
                    clearUserValues(_myElements[next].element);
                    continue;
                }
                if(_myElements[next].type == _me.guiBuilder.ELEMENT_BUTTON)
                    try{_myElements[next].userValue = null;}catch(err){console.log(err.message);}
            }
        }
        setTimeout(() => {_guardar( _myElem, _divId, mewArray) }, 1);
        function _guardar( _myElem, _divId, mewArray)
        {
            mewArray = Object.values(mewArray);
            _me.addAditionalInfoToMeasurement(mewArray);
            _me.currentMedicion.detail.push(mewArray);
            _me.currentMedicion.summary = {elements:_me.divElementsMap.get(_divId), mapCounter:_me.contadorMap, lastRecord: _me.lastRecord};
            filesHandler.grabarMedicion(_me.currentMedicion)
            .then((_medicion)=>{
                if(typeof _medicion != 'object') return;
                _me.guiBuilder.showLastRecordArea(_me.lastRecord);
            });
        }
    },
    addAditionalInfoToMeasurement:  function(_measurement){
        let _position = _me.utils.getPosition()
        _measurement.push({type:"deviceDateTime",   label:"Hora Mobile",    userValue:  _me.utils.getUtcIsoDateTime()});
        _measurement.push({type:"gpsTimestamp",     label:"Timestamp Gps",  userValue: (_position.timestamp) ? _me.utils.getUtcIsoDateTimeFromTime(_position.timestamp) : null });
        _measurement.push({type:"coordinates",      label:"Coordenadas",    userValue: (_position.lat && _position.lon ) ? _position.lat + "," + _position.lon : null});

    },
    onChangeRadio:  function(_radioButton, _elementId, optionId){
        _me.onChangeSelector(_elementId, optionId);
    },
    // onChangeSelector : function(_elementId, optionId)
    // {
    //     console.log("onChangeSelector>>>>" + _elementId);
    //     //alert("onChangeSelector>>>>" + _elementId);
    //     let _element = _me.elementsMap.get(_elementId);
    //     console.log(JSON.stringify(_element));
    //     console.log("Entrando>>>>>");
    //     if(_element.childrenComponent === undefined || !_element.childrenComponent || _element.childrenComponent.length < 1) return;
    //     console.log("Procesando onchange para componente id>>>>" + _element.id);
    //     let myElement = null;
    //      let _htmlElement = null;
    //     for(let next = 0; next < _element.childrenComponent.length; next++ ){
    //         myElement = _me.elementsMap.get(_element.childrenComponent[next])
    //         if( myElement === undefined || !myElement) continue;
    //         console.log("Existe en pantalla actual");
    //         alert("Existe en pantalla actual>>>" + myElement.id);
    //         if(myElement.optionsByParent === undefined || !myElement.optionsByParent || myElement.optionsByParent.length < 1) continue;
    //         console.log("Tiene opciones by parent>>Element ID>>>" + _element.id + ">>>option>>>>" + optionId + "  ????");
    //         _htmlElement = $('#' + myElement.id );
    //         _htmlElement.empty();
    //         _htmlElement.append('<option value="-1"></option>');
    //         try{_htmlElement.val('').selectmenu('refresh', true);}catch(err){console.log(err.message);}
    //         for(next2 = 0; next2 < myElement.optionsByParent.length; next2++ ){
    //             if(myElement.optionsByParent[next2].parentId != optionId) continue;
    //             console.log("Tenemos opciones para el id >>>" + optionId );
    //             console.log("Añadimos las opciones a componente >>>" + myElement.id );
    //             for(next3 = 0; next3 < myElement.optionsByParent[next2].options.length; next3++ ){
    //                  _htmlElement.append('<option value="' + myElement.optionsByParent[next2].options[next3].id + '">' +  myElement.optionsByParent[next2].options[next3].name + '</option>');
    //             }
    //             break;
    //         }
    //         //alert(_htmlElement.children('option').length);
    //         _htmlElement.trigger("create");
    //
    //         if( _htmlElement.children('option').length < 2 && myElement.showOnlyWithOptions)
    //             $("#fld_" + myElement.id ).hide();
    //         else $("#fld_" + myElement.id ).show();
    //
    //
    //     }
    //     if(_element.withDescription)
    //     {
    //         let _labelId = "optionDescription_" + _element.id;
    //         $("#" + _labelId).remove();
    //         for(let next = 0; next < _element.option.length; next++)
    //         {
    //             if(_element.option[next].id != opcionId ) continue;
    //             if(_element.option[next].description)
    //                 $("#fld_" + _element.id ).append('<label id="' + _labelId + '" style="width:70%">' + _element.option[next].description.replace(/\|/g, "<br/>" ) + '</label >');
    //             break;
    //         }
    //     }
    //
    //     function selectorType( _element, _htmlElement, _optionId ){
    //         _htmlElement = $('#' + myElement.id );
    //         _htmlElement.empty();
    //         _htmlElement.append('<option value="-1"></option>');
    //         try{_htmlElement.val('').selectmenu('refresh', true);}catch(err){console.log(err.message);}
    //         for(next2 = 0; next2 < _element.optionsByParent.length; next2++ ){
    //             if(_element.optionsByParent[next2].parentId != _optionId) continue;
    //             console.log("Tenemos opciones para el id >>>" + _optionId );
    //             console.log("Añadimos las opciones a componente >>>" + _element.id );
    //             for(next3 = 0; next3 < _element.optionsByParent[next2].options.length; next3++ ){
    //                  _htmlElement.append('<option value="' + _element.optionsByParent[next2].options[next3].id + '">' +  _element.optionsByParent[next2].options[next3].name + '</option>');
    //             }
    //             break;
    //         }
    //         //alert(_htmlElement.children('option').length);
    //         _htmlElement.trigger("create");
    //
    //         if( _htmlElement.children('option').length < 2 && _element.showOnlyWithOptions)
    //             $("#fld_" + _element.id ).hide();
    //         else $("#fld_" + _element.id ).show();
    //     }
    // },
    onChangeSelector : function(_elementId, _optionId)
    {
        console.log("onChangeSelector>>>>" + _elementId);
        //alert("onChangeSelector>>>>" + _elementId);
        let _element = _me.elementsMap.get(_elementId);
        console.log(JSON.stringify(_element));
        console.log("Entrando>>>>>");
        if(_element.childrenComponent === undefined || !_element.childrenComponent || _element.childrenComponent.length < 1) return;
        console.log("Procesando onchange para componente id>>>>" + _element.id);
        let _childElement = null;
        for(let next = 0; next < _element.childrenComponent.length; next++ ){
            _childElement = _me.elementsMap.get(_element.childrenComponent[next])
            if( _childElement === undefined || !_childElement) continue;
            if( _childElement.type == _me.guiBuilder.ELEMENT_SELECTION ) selectorType( _childElement, _optionId );
            else if( _childElement.type == _me.guiBuilder.ELEMENT_TEXT ) textType(  _childElement, _optionId );
        }
        if(_element.withDescription){
            let _labelId = "optionDescription_" + _element.id;
            $("#" + _labelId).remove();
            for(let next = 0; next < _element.option.length; next++)
            {
                if(_element.option[next].id != opcionId ) continue;
                if(_element.option[next].description)
                    $("#fld_" + _element.id ).append('<label id="' + _labelId + '" style="width:70%">' + _element.option[next].description.replace(/\|/g, "<br/>" ) + '</label >');
                break;
            }
        }

        function selectorType( _element, _optionId ){
            if(_element.optionsByParent === undefined || !_element.optionsByParent || _element.optionsByParent.length < 1) return;
            let _htmlElement = null;
            _htmlElement = $('#' + _element.id );
            _htmlElement.empty();
            _htmlElement.append('<option value="-1"></option>');
            try{_htmlElement.val('').selectmenu('refresh', true);}catch(err){console.log(err.message);}
            for(next2 = 0; next2 < _element.optionsByParent.length; next2++ ){
                if(_element.optionsByParent[next2].parentId != _optionId) continue;
                console.log("Tenemos opciones para el id >>>" + _optionId );
                console.log("Añadimos las opciones a componente >>>" + _element.id );
                for(next3 = 0; next3 < _element.optionsByParent[next2].options.length; next3++ ){
                     _htmlElement.append('<option value="' + _element.optionsByParent[next2].options[next3].id + '">' +  _element.optionsByParent[next2].options[next3].name + '</option>');
                }
                break;
            }
            //alert(_htmlElement.children('option').length);
            _htmlElement.trigger("create");

            if( _htmlElement.children('option').length < 2 && _element.showOnlyWithOptions)
                $("#fld_" + _element.id ).hide();
            else $("#fld_" + _element.id ).show();
        }

        function textType( _element, _optionId ){
             $('#' + _element.id ).val("");
            if( _element.parentId && _element.parentId == _optionId )$("#fld_" + _element.id ).show();
            else $("#fld_" + _element.id ).hide();
        }
    },
    logout      : function(){
            //console.log("logout...");
            filesHandler.doLogout()
            .then(_result=>{
                $("#pag_login").show(); $.mobile.changePage("#pag_login", { transition: "slide" });
            })

    },
    back        : function(_page)
    {
        if( _page.id == "pag_medicionHeader" )      $.mobile.changePage("#pag_campanias", { transition: "slide" });
        else if( _page.id == "pag_medicionDetail" ) $.mobile.changePage("#pag_medicionHeader", { transition: "slide" });
        else if( _page.id == "pag_campanias" ){
              $.mobile.changePage("#pag_estudios", { transition: "slide" });
              _me.buildEstudios();
        }

    },
    getCampanias: function()
    {
        _me.campaniasMap = new Map();
        _me.campaniasList = _me.currentEstudio.campanias;
        if(!_me.campaniasList) return null;
        for(let next = 0; next < _me.campaniasList.length; next++)_me.campaniasMap.set(_me.campaniasList[next].id.toString(), _me.campaniasList[next]);
        return _me.campaniasList;
    },
    getEstudios: function()
    {
        _me.estudiosMap = new Map();
        $.ajax({ url:"campanias.json", dataType : 'json', async : false, success : function(data) {_me.estudiosList = data;} });
        if(!_me.estudiosList) return null;
        for(let next = 0; next < _me.estudiosList.length; next++)_me.estudiosMap.set(_me.estudiosList[next].id.toString(), _me.estudiosList[next]);
        return _me.estudiosList;
    },
    onDeviceReady: function() {
        document.addEventListener("resume", _me.reanudar, false);

        $( "a" ).click(_me.clickEvent);
        console.log("onDeviceReady>>>" + 1);
        _me.utils.setPosition();
        console.log("onDeviceReady>>>" + 2);
        filesHandler.inicializar({config: _me.CONFIG});
        console.log("onDeviceReady>>>" + 3);
        filesHandler.utils = _me.utils;
        console.log("onDeviceReady>>>" + 4);
        filesHandler._processOfflineElements();
        console.log("onDeviceReady>>>" + 5);
        screen.orientation.lock('portrait-primary');
        setTimeout(function(){_me.checkConnection(),_me.guiBuilder.menu();}, 5000);
        _me.guiBuilder.showPopupModal();
        _me.guiBuilder.hideMapPopup();
        _me.inicializaLogin();
    },
    clickEvent  : function(event)
    {
        try{
            if(event.target.dataset.icon == "power")       _me.logout();
            else if( event.target.dataset.icon == "back")
            {
                let _currentPage = $.mobile.activePage.attr('id');
                _me.back(event.target.parentElement.parentElement);

            }
            else if( event.target.dataset.icon == "bars") _me.guiBuilder.menuOptions(event.target);
        }
        catch(err) {console.log(err.message);}
    },
    reanudar    : function()
    {
    },
    receivedEvent: function(id) {
    },
    onBackKeyDown   : function(_e)
    {
        let _currentPage = $.mobile.activePage.attr('id');
        _e.preventDefault();
        if(_currentPage == "pag_login")         return;
        else if(_currentPage == "pag_estudios") return;
        else if(_currentPage == "pag_campanias") {
            _me.guiBuilder.showPopupModal();
            _me.procesarUsuarioLogueado();
            return;
        }
        else if(_currentPage == "pag_medicionHeader") {
            navigator.app.backHistory();
            return
        }
        else if(_currentPage == "pag_medicionDetail") return;
    },

    checkConnection:   function()
    {
        if(_me.utils.hasConnection()) return;
        setTimeout(function(){_me.guiBuilder.showInfoMessage("Sin Conexión a Internet.", document.getElementById($.mobile.activePage.attr('id')))}, 600 );
    }
};

mainApp.initialize();
