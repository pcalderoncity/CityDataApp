class GuiBuilder {

    constructor( _infoMessageTimeoutInMillis = 2000) {
        this.INFO_MESSAGE_TIMEOUT_IN_MILLIS = _infoMessageTimeoutInMillis;
        this.ELEMENT_BUTTON                 = "button";
        this.ELEMENT_TEXT                   = "text";
        this.ELEMENT_SELECTION              = "selection";
        this.ELEMENT_SEPARATOR              = "separator";
        //this.ELEMENT_SELECTION2             = "selection2";
        //this.ELEMENT_SELECTION2             = "groupingSelectors";
        this.ELEMENT_GROUPING_SELECTORS     = "groupingSelectors";
        this.ELEMENT_NUMBER                 = "number";
        this.ELEMENT_LIST                   = "list";
        this.ELEMENT_IMAGE                  = "image";
        this.ELEMENT_MAP                    = "map";
        this.ELEMENT_OPTIONS_WITH_IMAGES    = "optionsWithImages";
        this.OPTIONS_NUMBER_RADIO_BUTON     = 2;
        this.LAST_RECORD_DIV_ID             = "lastRecord";
        this.autocompleteMapElements        = new Map();
        this.autocompleteMapObjects         = new Map();
        //this.autocompleteMapValidValues     = new Map();
    }
    getConfirmationPopup(_title, _content){
        let html = '';
         html = '<div data-role="popup" id="mypDialog" data-overlay-theme="b" data-theme="a" data-dismissible="false" >';
        html += '<div data-role="header"><h1 style="">' + _title + '</h1><a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a></div>';
        html += '<div role="main" class="ui-content">' + _content + '<a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline" data-rel="back">Cancelar</a><a id="btnPopOK" href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline" data-transition="flow">Aceptar</a></div>';
        html += '</div>';
        return html;
    }
    resetAutoCompleteMapElements(){
        this.autocompleteMapElements.clear();
        for (let [_id, _element] of this.autocompleteMapObjects) {
            _element.destroy();
        }
        this.autocompleteMapObjects.clear();
        //this.autocompleteMapValidValues.clear();
    }
    getAutocompleteMapElements(){
        return this.autocompleteMapElements;
    }
    getAutocompleteMapObjects(){
        return this.autocompleteMapObjects;
    }
    getCounterPopup(_title, _content){
        let html = '';
        html = '<div data-role="popup" id="mypDialog" data-overlay-theme="b" data-theme="a" data-dismissible="false" >';
        html += '<div data-role="header"><h1>Número</h1><a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a></div>';
        html += '<div role="main" class="ui-content" style="text-align:center;align:center"> <input type="text" data-role="spinbox"  readonly name="spin" id="spin" data-options=\'{"type":"horizontal"}\' value="2" min="-20" max="100" /><a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline" data-rel="back">Cancelar</a><a id="btnPopOK" href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline" data-transition="flow">Aceptar</a></div>';
        html += '</div>';
        return html;
    }
    getLastRecordArea(){
        let  _html = '<div class="ui-content" id="' + this.LAST_RECORD_DIV_ID + '" style="display:none;border-style: solid;border-width: 1px 1px 1px 1px;font-size:0.8em"></div>';
        return _html;
    }
    buildMapPopup( _elementProperties ){
        let _globalElementProperties = mainApp.elementsMap.get(_elementProperties.textId);
        $("#map_popup").remove();
        let _html = '';
        if(!mainApp.utils.hasConnection()){

            _html = '<div data-role="popup" id="map_popup" data-position-to="#pag_medicionHeader" data-transition="turn" data-dismissible="false"><div data-role="header" data-theme="a" style=""><h1>Sin Conexión</h1></div>';
            //_html += '<div role="main" class="ui-content" id="medicionHeaderMapContainer" style="background-color:transparent;margin:0px;border:0px;padding:0px"><div id="map_offline" style="width:50em;height:5em;background-color:transparent"><a style="text-decoration: none;" id="href_map" style="line-height: 4em;" href="geo:-33.4472847, -70.65301514">&nbsp;&nbsp;&nbsp;-Mapa Offline</a></div><div><input id="searchInput_" style="width:20em"  type="text" placeholder="Pegue las coordenadas"></div></div>';
            _html += '<div role="main" class="ui-content" id="medicionHeaderMapContainer" style="background-color:transparent;margin:0px;border:0px;padding:0px">';
            _html += '<div id="map_offline" style="width:25em;height:15em;background-color:transparent;text-align:center">' +
					       '<a id="href_map" style="line-height: 4em;" href="geo:-33.4472847, -70.65301514">Mapa Offline</a>' +
						   '<input id="searchInput" style="" type="text" placeholder="Copie las Coordenadas" value="" readonly>' +
						   '<button type="button" id="btnAcceptMap"  style="background-color:#33cc33;text-shadow:0px 0px 0px #fff">aceptar</button>' +
                           '<button type="button" id="btnCancelMap" style="background-color:#ff3333;text-shadow:0px 0px 0px #fff">Cancelar</button>' +
					'</div>';
            _html += '</div></div>';
            $("#" + $.mobile.activePage.attr('id')).append(_html);
            $('#map_popup').popup();
            $("#btnAcceptMap").on("click", function(){
                let _value = $('#searchInput').val();
                $('#' + _elementProperties.textId).val( _value );
                _globalElementProperties.isOffline = true;
                $("#map_popup").popup("close");
            });
            $("#btnCancelMap").on("click", function(){$("#map_popup").popup("close");});
            $('#searchInput').on('click', function () {cordova.plugins.clipboard.paste(function (text) {$('#searchInput').val(_gmapLink(text)); }); });
            function _gmapLink(_text){
                _text += " ";
                let _parts = _text.split("https");
                console.log(_text);
                if(!Array.isArray(_parts) || _parts.length < 2 ) return "";
                _parts = _parts[1].split(" ");
                if(!Array.isArray(_parts) || _parts.length < 2 ) return "";
                let _myLink = "https" + _parts[0];
                return _myLink;
            }
            return;
        }
        _html = '<div data-role="popup" id="map_popup" data-position-to="#pag_medicionHeader" data-transition="turn" data-dismissible="true"><div data-role="header" data-theme="a"><h1>Haga clic en lugar</h1></div>';
        _html += '<div role="main" class="ui-content" id="medicionHeaderMapContainer" style="background-color:transparent;margin:0px;border:0px;padding:0px"><input id="searchInput" class="controls" type="text" placeholder="Ingrese lugar"><div id="map_area"></div>';
        //_html += '<button type="button" id="btnAcceptMap"  style="background-color:#33cc33;text-shadow:0px 0px 0px #fff">aceptar</button><button type="button" id="btnCancelMap" style="background-color:#ff3333;text-shadow:0px 0px 0px #fff">Cancelar</button></div></div>';
        _html += '</div><div data-role="controlgroup" data-type="horizontal" style="align:center;text-align:center" ><button type="button" id="btnAcceptMap"  style="width:11em;background-color:#33cc33;text-shadow:0px 0px 0px #fff">aceptar</button><button type="button" id="btnCancelMap" style="width:11em;margin-left:2em;background-color:#ff3333;text-shadow:0px 0px 0px #fff">Cancelar</button></div></div>';
        $("#" + $.mobile.activePage.attr('id')).append(_html);
        var script = document.createElement( "script" );script.type = "text/javascript";
        script.src = "http://maps.googleapis.com/maps/api/js?v=3.34&client=gme-citymovil&libraries=places";
        if( typeof google === 'undefined' || !google)
            $("#map_popup").append(script);

        $('#map_popup').popup();
        $("#btnAcceptMap").on("click", function(){
            let _value = mainApp.markerMap.getPosition().lat()  + "," + mainApp.markerMap.getPosition().lng();
            $('#' + _elementProperties.textId).val( _value );
            _globalElementProperties.isOffline = false;
            $("#map_popup").popup("close");
        });
        $("#btnCancelMap").on("click", function(){$("#map_popup").popup("close");});

        let _centerLat = -33.4472847;
        let _centerLon = -70.65301514;
        let _searchBoxSouthWestLat = -33.79011445977004;
        let _searchBoxSouthWestLon = -71.69641113121094;
        let _searchBoxNorthEastLat = -33.03778719859441;
        let _searchBoxNorthEastLon = -70.3288957589844;
        let _searchBoxStrictBounds = true;
        let _tmpCoordinates = null;
        if( _globalElementProperties.startCoordinates !== undefined )
        {
            _tmpCoordinates = mainApp.utils.getCoordinatesFromString(_globalElementProperties.startCoordinates);
            console.log(JSON.stringify(_tmpCoordinates));
            if( _tmpCoordinates.lat && _tmpCoordinates.lon )
            {
                _centerLat = _tmpCoordinates.lat;
                _centerLon = _tmpCoordinates.lon;
            }
        }
        if( _globalElementProperties.searchboxSouthWestCoordinates !== undefined )
        {
            _tmpCoordinates = mainApp.utils.getCoordinatesFromString(_globalElementProperties.searchboxSouthWestCoordinates);
            if( _tmpCoordinates.lat && _tmpCoordinates.lon )
            {
                _searchBoxSouthWestLat = _tmpCoordinates.lat;
                _searchBoxSouthWestLon = _tmpCoordinates.lon;
            }
        }
        if( _globalElementProperties.searchboxNorthEastCoordinates !== undefined )
        {
            _tmpCoordinates = mainApp.utils.getCoordinatesFromString(_globalElementProperties.searchboxNorthEastCoordinates);
            if( _tmpCoordinates.lat && _tmpCoordinates.lon )
            {
                _searchBoxNorthEastLat = _tmpCoordinates.lat;
                _searchBoxNorthEastLon = _tmpCoordinates.lon;
            }
        }
        if( _globalElementProperties.searchboxStrictBounds !== undefined ) _searchBoxStrictBounds = _globalElementProperties.searchboxStrictBounds;
        mainApp.mapObj = new google.maps.Map(document.getElementById('map_area'), {zoom: 17, gestureHandling: "greedy", disableDefaultUI: true, clickableIcons: false});
        mainApp.mapObj.setCenter(new google.maps.LatLng(_centerLat, _centerLon));
        mainApp.mapObj.setZoom(9);
        mainApp.markerMap = new google.maps.Marker({});
        mainApp.markerMap.setMap(mainApp.mapObj);

        let _input = document.getElementById('searchInput');
        mainApp.mapObj.controls[google.maps.ControlPosition.TOP_CENTER].push(_input);
        mainApp.mapObj.currentDiv = $.mobile.activePage.attr('id');
        let _southWest = new google.maps.LatLng(_searchBoxSouthWestLat, _searchBoxSouthWestLon);
        let _northEast = new google.maps.LatLng(_searchBoxNorthEastLat, _searchBoxNorthEastLon);
        let _bounds = new google.maps.LatLngBounds( _southWest, _northEast );
        // let _options = {types: ['address'], componentRestrictions: {country: "cl"}, bounds:_bounds, strictBounds:true };
         let _options = {types: ['geocode', 'establishment'], componentRestrictions: {country: "cl"}, bounds:_bounds, strictBounds: _searchBoxStrictBounds };
        let _searchBox = new google.maps.places.Autocomplete(_input, _options);


        google.maps.event.addListener(_searchBox, 'place_changed', function(){
                var _place = _searchBox.getPlace();
                if (_place.geometry.viewport) 	mainApp.mapObj.fitBounds(_place.geometry.viewport);
                else							mainApp.mapObj.setCenter(_place.geometry.location);
                 mainApp.markerMap.setPosition(_place.geometry.location);
                 mainApp.mapObj.setZoom(16);
                 mainApp.mapObj.setCenter(_place.geometry.location);
        });
        google.maps.event.addListener(mainApp.mapObj, 'click', function(event) {  mainApp.markerMap.setPosition(event.latLng); });
    }
    buildImagePopup( _elementProperties ){
        $("#image_popup").remove();
        let _html = '';
        let _imgPath = (_elementProperties.img === undefined || !_elementProperties.img) ? "no_img.png" : _elementProperties.img;
        _imgPath = "img/" + _imgPath;
        _html = '<div data-role="popup" id="image_popup" data-position-to="#pag_medicionDetail" class="photopopup__" data-overlay-theme="a" data-corners="false" data-tolerance="50,30"><a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Cerrar</a><img src="' + _imgPath + '" alt="Imagen"></div>';
        //console.log(_html);
        $("#" + $.mobile.activePage.attr('id')).append(_html);
        $('#image_popup').popup();
        $('#image_popup img').on('load', function() {
                $('#image_popup').popup('open', {'positionTo': 'window'});
        });
    }
    buildOptionsWithImagesPopup(_elementProperties){
        let _globalElementProperties = mainApp.elementsMap.get(_elementProperties.textId);
        let _popupId = '#optionsWithImagesPopup';
        $(_popupId).remove();
        let _html = '';
        _html =     '<div data-role="popup" id="optionsWithImagesPopup" data-position-to="#pag_medicionHeader" data-transition="turn" data-dismissible="false">';
        _html +=    '<div role="content" class="ui-content" id="optionsWithImagesPopupMain" style="width:98vw;height:97vh;padding:0px">';
        _html +=    '<div class="ui-grid-a" style="background-color:#eee;width:97vw;height:97vh;padding:0px;border: 0px;overflow-y: scroll;overflow-x: scroll;">';
        let _allOptionsIds = [_globalElementProperties.option[0].id,_globalElementProperties.option[1].id];
        _html +=   getHeaderOption(_globalElementProperties.option[0], "a", _elementProperties.textId, _allOptionsIds) + getHeaderOption(_globalElementProperties.option[1], "b", _elementProperties.textId, _allOptionsIds);
        _html +=   getImgOption(_globalElementProperties.option[0], "a", _elementProperties.textId, _allOptionsIds)    + getImgOption(_globalElementProperties.option[1], "b", _elementProperties.textId, _allOptionsIds);
        //_html += "<div>&nbsp;</div>";
        // if(_globalElementProperties.unanswerOption != undefined){
        //     _html +=    '<div class="ui-block-a"><div class="ui-bar ui-bar-a" ><button id="optionsWithImagesUnanswer">' + _globalElementProperties.unanswerOption.label + '</button></div></div>';
        //     _html +=    '<div class="ui-block-b"><div class="ui-bar ui-bar-a" ><button id="optionsWithImagesCancel">CANCELAR</button></div></div>';
        // }
        // else _html +=    '<div class="ui-grid-solo"><div class="ui-bar ui-bar-a" ><button id="optionsWithImagesCancel">CANCELAR</button></div></div>';


        if(_globalElementProperties.unanswerOption != undefined){
            _html +=    '<div class="ui-block-a"><div class="ui-bar ui-bar-a" ><button id="optionsWithImagesUnanswer">' + _globalElementProperties.unanswerOption.label + '</button></div></div>';
            _html +=    '<div class="ui-block-b"><div class="ui-bar ui-bar-a" ><button id="optionsWithImagesAccept" >ACEPTAR</button></div></div>';
        }
        else _html +=    '<div class="ui-grid-solo"><div class="ui-bar ui-bar-a" ><button id="optionsWithImagesAccept">ACEPTAR</button></div></div>';


        _html +=    '</div>';
        _html +=    '</div>';
        _html +=    '</div>';

        console.log(_html);
        $("#" + $.mobile.activePage.attr('id')).append(_html);
        $(_popupId).popup();
        //$(_popupId).css('overflow-x', 'scroll');
        //$(_popupId).css('overflow-y', 'scroll');
        $(_popupId).on({
        popupbeforeposition: function() {

                //var maxHeight = $(window).height() - 50;
                //$(_popupId).css('max-height', maxHeight + 'px');
            }
        })

        $("#optionsWithImagesUnanswer").on("click", function(){
            $(_popupId).popup("close");
            screen.orientation.lock('portrait-primary');
            $("#" + _elementProperties.textId).val(_globalElementProperties.unanswerOption.label);
            $("#" + _elementProperties.textId).attr( 'optionsWithImagesOptionId', _globalElementProperties.unanswerOption.id);
            //$(_popupId).popup("close");
            screen.orientation.unlock();
        });
        // $("#optionsWithImagesCancel").on("click", function(){
        //     screen.orientation.lock('portrait-primary');
        //     $(_popupId).popup("close");
        // });
        $("#optionsWithImagesAccept").on("click", function(){
            if(!$("#optionsWithImagesAccept").attr("optionWitImgSelectedId"))
            {
                alert("Por favor, seleecione una alternativa")
                return;
            }
            screen.orientation.lock('portrait-primary');
            $("#" + _elementProperties.textId).val($("#optionsWithImagesAccept").attr("optionWitImgSelectedLabel"));
            $("#" + _elementProperties.textId).attr( 'optionsWithImagesOptionId', $("#optionsWithImagesAccept").attr("optionWitImgSelectedId"));

            $(_popupId).popup("close");
        });

        function getHeaderOption(_option, _blockLetter, _textId, _allOptionsIds){
            let _class = 'ui-block-' + _blockLetter;
            let _id = "optWithImg_header_" + _option.id;
            let _html =     '<div class="' + _class + '"  onclick="mainApp.BORRAMEENCAPSULAME(' + _option.id + ',\'' + _option.label + '\', \'' + _textId +'\' , [' + _allOptionsIds +'] )">';
            _html +=    '<div id="'+_id +'" class="ui-bar ui-bar-a" style="background-color:#eee;text-align:center;margin:2px;padding:5px;" >';
            let _table = '<table  style="background-color:#eee;border: 1px solid black;padding:0px" data-role="table" id="movie-table" data-mode="reflow" class="ui-responsive" >';
            _table += '<thead><th style="text-align:center;text-decoration: underline">' + _option.label + '</th></thead>';
            _table += '<tbody>';
            if(_option.header){
                 for(let _next = 0; _next < _option.header.length; _next++)
                     _table += '<tr><td>' + ((_option.header[_next]) ? _option.header[_next] : "&nbsp;")  + '</td></tr>';

                // for(let _next = 0; _next < 5; _next++)
                // {
                //     if( typeof _option.header[_next] === "undefined") _option.header[_next] = "&nbsp;";
                //     _table += '<tr><td>' + _option.header[_next] + '</td></tr>';
                // }


            }
            _table += '</tbody>';
            _table += '</table>';
            _html += _table;
            _html +=    '</div>';
            _html +=    '</div>';
            return _html;
        }
        function getImgOption(_option, _blockLetter, _textId, _allOptionsIds){
            let _img = 'img/optionsWithImages/' + _option.img;
            let _id = "optWithImg_img_" + _option.id;
            let _class = 'ui-block-' + _blockLetter;
            let _html =     '<div class="' +_class+ '" onclick="mainApp.BORRAMEENCAPSULAME(' + _option.id + ',\'' + _option.label + '\', \'' + _textId +'\', [' + _allOptionsIds +'] )">';
            _html +=    '<div class="ui-bar ui-bar-a" id="'+_id +'" style="background-color:#eee;text-align:center;margin:2px;padding:5px;">';
            _html +=     '<table data-role="table"  style="background-color:#eee;border: 1px solid black;" data-mode="reflow" class="ui-responsive" style="border: 1px solid rgb(51,51,51);padding:0px">';
            _html +=     '<thead><th style="margin:0px;padding:0px;"></th></thead>';
            _html +=     '<tbody><tr><td><img style="width:100%; height:100%" src="' + _img + '"></img></td></tr></tbody>';
            _html +=     '</table>';
            _html +=    '</div>';
            _html +=    '</div>';
            //console.log("getImgOption");
            //console.log(_html);
            return _html;
        }
    }
    showLastRecordArea(_lastRecord){
        let _html_h = '';
        if( mainApp.currentMedicion && mainApp.currentMedicion.header && Array.isArray(mainApp.currentMedicion.header))
        {
            for(let _next = 0; _next < mainApp.currentMedicion.header.length; _next++)
                _html_h += '<div class="ui-block-a" style="width:35%"><strong>' + mainApp.currentMedicion.header[_next].label + ': </strong></div><div class="ui-block-b"> ' + (( mainApp.currentMedicion.header[_next].userValue == undefined || !mainApp.currentMedicion.header[_next].userValue) ? "" : mainApp.currentMedicion.header[_next].userValue.text) + '</div>';
            _html_h += '<div class="ui-block-a" style="width:35%"><strong>Inicio: </strong></div><div class="ui-block-b"> ' +  mainApp.currentMedicion.inicioLocale + '</div>';
            _html_h = '<div class="ui-grid-a">' + _html_h + '</div>';
        }
        let _html_d = '';
        if(typeof _lastRecord == 'object' &&  Array.isArray(_lastRecord) && _lastRecord.length > 0  ){
            for(let _next = 0; _next < _lastRecord.length; _next++)
                _html_d += '<div class="ui-block-a" style="width:35%"><strong>' + _lastRecord[_next].key + ': </strong></div><div class="ui-block-b"> ' + ((! _lastRecord[_next].value ) ? "" :_lastRecord[_next].value) + '</div>';
            _html_d = '<div class="ui-grid-a">' + _html_d + '</div>';
        }
        $("#" +  this.LAST_RECORD_DIV_ID ).html( _html_h + '<ul><li style="display: block;  height: 1px;width: 80%;margin: 0% 7%;background: #000; background-position:center center;"></li></ul>' + _html_d);
        $("#" +  this.LAST_RECORD_DIV_ID).show();
    }
    hideLastRecordArea(){
        $("#" +  this.LAST_RECORD_DIV_ID ).html("");
        $("#" +  this.LAST_RECORD_DIV_ID).hide();
    }
    showInfoMessage(_message, _currentDiv){
        let _popupDiv = '<div data-role="popup" id="p" data-transition="turn"><p style="color:red;font-weight:bold">' + _message +'</p></div>';
        $("#p").remove();
        $("#" + _currentDiv.id ).append( _popupDiv);
        $("#" + _currentDiv.id ).trigger('create');
        $("#p").popup("open");
        //alert("HERE");
        setTimeout(function(){  $("#p").popup("close"); }, this.INFO_MESSAGE_TIMEOUT_IN_MILLIS);
    }
    getMapElement(_elementProperties){
        //let _buttonProperties= {id: "map_" + _elementProperties.id, textId: _elementProperties.id, type: this.ELEMENT_BUTTON, label: _elementProperties.label, action: mainApp.SHOW_MAP_ACTION, customStyle: "font-size:0.8em;margin:0.6em;", dataIcon:"search"};
        let _buttonProperties= {id: "map_" + _elementProperties.id, textId: _elementProperties.id, type: this.ELEMENT_BUTTON, label: "Ver", action: mainApp.SHOW_MAP_ACTION, customStyle: "font-size:0.8em;margin:0.6em;", dataIcon:"search"};
        let _button =   this.getButtonElement(_buttonProperties);
        let _html = '<div  id="{FIELD_ID}" class="ui-field-contain"><label for="{ELEMENT_ID}">' + this._getLabel(_elementProperties) + '</label>';
        _html += '<div data-role="controlgroup" data-type="horizontal" >';
        _html += '<div class="ui-grid-a" style="width: 90em !important;">';
        _html += '<div class="ui-block-a" style="width:22em"><input  name="{ELEMENT_ID}" id="{ELEMENT_ID}" type="text"  readonly></div>';
        _html += '<div class="ui-block-b" >' +_button+ '</div>';
        //_html += '<div class="ui-block-c" ><button data-icon="search" style="font-size:0.8em;margin:0.6em;">Buscar</button></div>';
        _html += '</div></div></div>';
        return  this._setGenericAttributes(_elementProperties, _html);
    }
    getSeparatorElement(_elementProperties){
        console.log("getSeparatorElement");

        let _template = '<div class="ui-corner-all custom-corners">' +
                            '<div class="ui-bar ui-bar-a">' +
                                '<div class="ui-grid-solo"><div class="ui-bar ui-bar-a" >' + this._getLabel( _elementProperties ) + ' </div></div>' +
                            '</div>' +
                            '</div>' +
                        '</div>';
        console.log(_template);
        return _template;
    }
    getImageElement(_elementProperties){
        let _buttonProperties   = {id: "map_" + _elementProperties.id, type: this.ELEMENT_BUTTON, label: "Ver", action: mainApp.SHOW_IMG_ACTION,  dataIcon:"eye", customStyle: "margin-left: 1em;", img:_elementProperties.img};
        let _button             =   this.getButtonElement(_buttonProperties);
        let _options = "";
        if(_elementProperties.option)
        {
            //_options += '<option value="-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>';
            _options += '<option value="-1" selected>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>';
            for(let next = 0; next < _elementProperties.option.length; next++)
            {
                _options += '<option value="' + _elementProperties.option[next].id + '" ' + (( _elementProperties.option[next].selected) ? "selected" : "")+'>' +  _elementProperties.option[next].name + '&nbsp;&nbsp;</option>';
            }

        }
        let _label = this._getLabel(_elementProperties);
        let _html = '<div  id="{FIELD_ID}" class="ui-field-contain"><label for="{ELEMENT_ID}">' + _label + '</label>';
        _html += '<div data-role="controlgroup" data-type="horizontal" >';
        _html += '<div class="ui-grid-a" style="width: 90em !important;">';
        _html += '<div class="ui-block-a" style="width:20em"><select  name="{ELEMENT_ID}" id="{ELEMENT_ID}">' + _options + '</select></div>';
        _html += '<div class="ui-block-c" >' +_button+ '</div>';
        _html += '</div></div></div>';
        return  this._setGenericAttributes(_elementProperties, _html);
    }
    getOptionsWithImagesElement(_elementProperties){
        let _buttonProperties   = {id: "img_" + _elementProperties.id, textId: _elementProperties.id, type: this.ELEMENT_BUTTON, label: "Ver", action: mainApp.SHOW_OPTIONS_WITH_IMAGES_ACTION,  dataIcon:"eye", customStyle: "margin-left: 1em;", img:_elementProperties.img};
        let _button             =   this.getButtonElement(_buttonProperties);

        let _label = this._getLabel(_elementProperties);
        let _html = '<div  id="{FIELD_ID}" class="ui-field-contain"><label for="{ELEMENT_ID}">' + _label + '</label>';
        let _defaultLabel = "-";
        _html += '<div data-role="controlgroup" data-type="horizontal" >';
        _html += '<div class="ui-grid-a" style="width: 90em !important;">';
        _html += '<div class="ui-block-a" style="width:20em"><input type="text" name="{ELEMENT_ID}" id="{ELEMENT_ID}" value="{INPUT_VALUE}" style="width:100vw" readonly/></div>';
        _html += '<div class="ui-block-c" >' +_button+ '</div>';
        _html += '</div></div></div>';
        //return  this._setGenericAttributes(_elementProperties, _html);
        _html = this._setGenericAttributes(_elementProperties, _html);
        let _value = "";
        if( _elementProperties.value )              _value = _elementProperties.value;
        else if( _elementProperties.defaultValue )  _value = _elementProperties.defaultValue;
        return _html.replace("{INPUT_VALUE}", _value );
    }
    getTextElement(_elementProperties){
        let _template = '<div id="{FIELD_ID}" data-role="fieldcontain" {STYLE_V}> <label id="{LABEL_ID}" for="{ELEMENT_ID}" >{LABEL}</label><input type="text" name="{ELEMENT_ID}" id="{ELEMENT_ID}" value="{INPUT_VALUE}" {READONLY}/></div>'
        if( _elementProperties.parentComponent && _elementProperties.parentId)
        {
            _elementProperties.visible = false;
            let _parentElement = mainApp.elementsMap.get(_elementProperties.parentComponent);
            if(_parentElement && _parentElement.type == this.ELEMENT_SELECTION)
            {
                //alert(_parentElement.userValue);
                if(_parentElement.userValue && _parentElement.userValue.id && _parentElement.userValue.id == _elementProperties.parentId )
                {
                    _elementProperties.visible = true;
                    alert(_elementProperties.visible);
                }

            }
        }
        _template = this._setGenericAttributes(_elementProperties, _template);
        let _value = "";
        if( _elementProperties.value )              _value = _elementProperties.value;
        else if( _elementProperties.defaultValue )  _value = _elementProperties.defaultValue;
        return _template.replace("{INPUT_VALUE}", _value );
    }
    getSelectorElement(_elementProperties){
        //return this.getSelectorElement_2(_elementProperties);
        console.log( "getSelectorElement");
        console.log(JSON.stringify(_elementProperties));
        if( _elementProperties.showOnlyWithOptions)
        {
            _elementProperties.visible = true;
            if( !_elementProperties.option || _elementProperties.option.length < 1  ) _elementProperties.visible = false;
        }

        if(this.isRadioButton(_elementProperties))
            return this._getRadioButtonElement(_elementProperties);
        //if((_elementProperties.autocomplete !== undefined && _elementProperties.autocomplete) ||  _elementProperties.option && _elementProperties.option.length > 40 && !_elementProperties.multipleChoice ) return this._getAutocomplete(_elementProperties);
        //console.log(JSON.stringify(_elementProperties));
        if(_elementProperties.autocomplete !== undefined && _elementProperties.autocomplete && !_elementProperties.multipleChoice)  return this._getAutocomplete(_elementProperties);
        let _template = '<div id="{FIELD_ID}" class="ui-field-contain" {STYLE_V} data-role="fieldcontain"> <label id="{LABEL_ID}" for="{ELEMENT_ID}">{LABEL}</label><select  {MULTIPLE} name="{ELEMENT_ID}" id="{ELEMENT_ID}" {MENU}>{OPTIONS}</select></div>';
        let _options = "";
        _elementProperties.withDescription = false;
        if(_elementProperties.option)
        {
            _options += '<option value="-1"></option>';
            for(let next = 0; next < _elementProperties.option.length; next++)
            {
                if(_elementProperties.option[next].description) _elementProperties.withDescription = true;
                _options += '<option value="' + _elementProperties.option[next].id + '" ' + (( _elementProperties.option[next].selected) ? "selected" : "")+'>' +  _elementProperties.option[next].name + '</option>';
            }

        }
        _template = this._setGenericAttributes(_elementProperties, _template);
        _template = _template.replace("{OPTIONS}", _options );
        _template = ( _elementProperties.multipleChoice ) ? _template.replace("{MULTIPLE}", 'multiple="multiple"').replace("{MENU}", 'data-native-menu="true"')  : _template.replace("{MULTIPLE}", '').replace("{MENU}", 'data-native-menu="true"');
        if( _elementProperties.childrenComponent || _elementProperties.withDescription )
             $(document).on('change', "#" +  _elementProperties.id, function () {mainApp.onChangeSelector(_elementProperties.id,this.value)});
        console.log(_template);
        return _template;
    }
    getSelectorElement_2(_elementProperties){
        console.log( "getSelectorElement");
        console.log(JSON.stringify(_elementProperties));
        if( _elementProperties.showOnlyWithOptions)
        {
            _elementProperties.visible = true;
            if( !_elementProperties.option || _elementProperties.option.length < 1  ) _elementProperties.visible = false;
        }

        if(this.isRadioButton(_elementProperties))
            return this._getRadioButtonElement(_elementProperties);
        //if((_elementProperties.autocomplete !== undefined && _elementProperties.autocomplete) ||  _elementProperties.option && _elementProperties.option.length > 40 && !_elementProperties.multipleChoice ) return this._getAutocomplete(_elementProperties);
        //console.log(JSON.stringify(_elementProperties));
        if(_elementProperties.autocomplete !== undefined && _elementProperties.autocomplete && !_elementProperties.multipleChoice)  return this._getAutocomplete(_elementProperties);
        let _template = '<div id="lbl_above_control_'+ _elementProperties.id +'">{LABEL_ABOVE_CONTROL}</div>';
        _template += '<div id="{FIELD_ID}" class="ui-field-contain" {STYLE_V} data-role="fieldcontain"> <label for="{ELEMENT_ID}">{LABEL}</label><select  {MULTIPLE} name="{ELEMENT_ID}" id="{ELEMENT_ID}" {MENU}>{OPTIONS}</select></div>';
        //let _template = '<div id="{FIELD_ID}" class="ui-field-contain" {STYLE_V} data-role="fieldcontain"> <label id="{LABEL_ID}" for="{ELEMENT_ID}">{LABEL}</label><select  {MULTIPLE} name="{ELEMENT_ID}" id="{ELEMENT_ID}" {MENU}>{OPTIONS}</select></div>';
        let _options = "";
        _elementProperties.withDescription = false;
        if(_elementProperties.option)
        {
            _options += '<option value="-1"></option>';
            for(let next = 0; next < _elementProperties.option.length; next++)
            {
                if(_elementProperties.option[next].description) _elementProperties.withDescription = true;
                _options += '<option value="' + _elementProperties.option[next].id + '" ' + (( _elementProperties.option[next].selected) ? "selected" : "")+'>' +  _elementProperties.option[next].name + '</option>';
            }

        }
        _template = this._setGenericAttributes(_elementProperties, _template);
        _template = _template.replace("{OPTIONS}", _options );
        _template = ( _elementProperties.multipleChoice ) ? _template.replace("{MULTIPLE}", 'multiple="multiple"').replace("{MENU}", 'data-native-menu="true"')  : _template.replace("{MULTIPLE}", '').replace("{MENU}", 'data-native-menu="true"');
        if( _elementProperties.childrenComponent || _elementProperties.withDescription )
             $(document).on('change', "#" +  _elementProperties.id, function () {mainApp.onChangeSelector(_elementProperties.id,this.value)});
        console.log(_template);
        return _template;
    }
    _getAutocomplete(_elementProperties){
        this.autocompleteMapElements.set(_elementProperties.id, _elementProperties );
        let _template = '<div id="{FIELD_ID}" data-role="fieldcontain" {STYLE_V}> <label id="{LABEL_ID}" for="{ELEMENT_ID}" >{LABEL}</label><input type="text" name="{ELEMENT_ID}" id="{ELEMENT_ID}" style="width:25em"/></div>';
        _template = this._setGenericAttributes(_elementProperties, _template);
        return _template;
    }
    getGroupingSelectors(_elementProperties){
        console.log("getGroupingSelectors");
        let _groupingContentId = "groupingContent_" + _elementProperties.id;
        let _template = '<div class="ui-corner-all custom-corners">' +
                            '<div class="ui-bar ui-bar-a">' +
                                '<fieldset class="ui-grid-a">' +
                                    '<div class="ui-block-a" style="height:1em;width:12em;background-color:transparent">' + this._getLabel( _elementProperties ) + ' </div>' +
                                    '<div class="ui-block-b" style="height:1.5em;width:8em;background-color:transparent"><a title="Agregar" onclick="mainApp.guiBuilder.showGroupingSelectorsPopup(\'' + _elementProperties.id + '\', \'' + _groupingContentId+'\' );" href="#" style="font-size:0.7em;color:green;">Agregar</a></div>' +
                                '</fieldset>' +
                            '</div>' +
                            '<div class="ui-body ui-body-a" id="'+_groupingContentId+'">' +
                            '</div>' +
                        '</div>';
        console.log("getGroupingSelectors");
        console.log(_template);
        return _template;
    }
    showGroupingSelectorsPopup(_elementId, _groupingContentId)
    {
        $("#grouping_popup").remove();
        let _this = this;
        //_this.resetAutoCompleteMapElements();
        //let _selector = this.getSelectorElement(mainApp.elementsMap.get(_elementId));
        let _elementProperties = mainApp.elementsMap.get(_elementId);
        console.log("_elementId>>>>>" + _elementId);
        console.log(_elementProperties.label);
        let _template = '<div id="{FIELD_ID}" class="ui-field-contain" data-role="fieldcontain"> <label id="{LABEL_ID}" for="{ELEMENT_ID}">{LABEL}</label><select  {MULTIPLE} name="{ELEMENT_ID}" id="{ELEMENT_ID}" {MENU}>{OPTIONS}</select></div>';
        let _options = "";
        if(_elementProperties.option)
        {
            _options += '<option value="-1"></option>';
            for(let next = 0; next < _elementProperties.option.length; next++)
                _options += '<option value="' + _elementProperties.option[next].id + '" ' + (( _elementProperties.option[next].selected) ? "selected" : "")+'>' +  _elementProperties.option[next].name + '</option>';

        }
        _template = this._setGenericAttributes(_elementProperties, _template);
        _template = _template.replace("{OPTIONS}", _options );
        _template = _template.replace("{MULTIPLE}", '').replace("{MENU}", '');

        let selectionCuadrasElement = null;
        let textElement             = null;
        let numberElement           = null;
        let selectionElement        = null;
        let autocompleteElement     = null;

        let lblCuadrasElement       = null;
        let lblTextElement          = null;
        let lblNumberElement        = null;
        let lblSelectionElement     = null;
        let lblAutocompleteElement  = null;

        _template += '<div id="fld_text_' + _elementProperties.id  + '" data-role="fieldcontain" style="display:none"> <label id="lb_text_' +_elementProperties.id + '" for="text_'+ _elementProperties.id +'" style=""></label><input type="text" name="text_'+ _elementProperties.id +'" id="text_'+ _elementProperties.id +'" value=""></div>';
        _template += '<div id="fld_autocomplete_' + _elementProperties.id  + '" data-role="fieldcontain" style="display:none"> <label id="lb_autocomplete_' +_elementProperties.id + '" for="autocomplete_'+ _elementProperties.id +'" style=""></label><input type="text" name="autocomplete_'+ _elementProperties.id +'" id="autocomplete_'+ _elementProperties.id +'" style="width:25em"/></div>';
        _template += '<div id="fld_selection_' + _elementProperties.id  + '" data-role="fieldcontain" style="display:none"> <label id="lb_selection_' +_elementProperties.id + '" for="selection_'+ _elementProperties.id +'" style=""></label><select name="selection_'+ _elementProperties.id +'" id="selection_'+ _elementProperties.id +'"></select></div>';
        _template += '<div id="fld_number_' + _elementProperties.id  + '" data-role="fieldcontain" style="display:none"> <label id="lb_number_' +_elementProperties.id + '" for="number_'+ _elementProperties.id +'" style=""></label><select name="number_'+ _elementProperties.id +'" id="number_'+ _elementProperties.id +'"></select></div>';
        _template += '<div id="fld_selection_cuadras_' + _elementProperties.id  + '" data-role="fieldcontain" style="display:none"> <label id="lb_selection_cuadras_' +_elementProperties.id + '" for="selection_cuadras_'+ _elementProperties.id +'" style=""></label><select name="selection_cuadras_'+ _elementProperties.id +'" id="selection_cuadras_'+ _elementProperties.id +'"></select></div>';

        let _html = '<div data-role="popup" id="grouping_popup"><div data-role="header" data-theme="a" style=""><h1>Nuevo</h1></div>';
        _html += '<div role="main" class="ui-content" id="groupingDivId" style="height:20em;background-color:transparent;margin:1.5em;border:0px;padding:0px"> ' + _template + '</div>';
        _html += '<div data-role="controlgroup" data-type="horizontal" style="align:center;text-align:center" ><button type="button" id="btnAccept"  style="width:10em;background-color:#33cc33;text-shadow:0px 0px 0px #fff">aceptar</button><button type="button" id="btnCancel" style="width:10em;margin-left:2em;background-color:#ff3333;text-shadow:0px 0px 0px #fff">Cancelar</button></div>';
        _html += '</div>';

        $("#" + $.mobile.activePage.attr('id')).append(_html);

        $("#" + _elementProperties.id).on('change',function(){
            let optionId = this.value;
            let fldCuadrasElement          = $( "#fld_selection_cuadras_" + _elementId);
            lblCuadrasElement          = $("#lb_selection_cuadras_" + _elementId);
            selectionCuadrasElement    = $("#selection_cuadras_" + _elementId);

            let fldTextElement             = $( "#fld_text_" + _elementId );
            let fldNumberElement           = $( "#fld_number_" + _elementId );
            let fldSelectionElement        = $( "#fld_selection_" + _elementId );
            let fld_autocomplete           = $( "#fld_autocomplete_" + _elementId );

            lblTextElement             = $("#lb_text_" + _elementId);
            lblNumberElement           = $("#lb_number_" + _elementId);
            lblSelectionElement        = $("#lb_selection_" + _elementId);
            lblAutocompleteElement     = $("#lb_autocomplete_" + _elementId);

            textElement                = $("#text_" + _elementId);
            numberElement              = $("#number_" + _elementId);
            selectionElement           = $("#selection_" + _elementId);
            autocompleteElement        = $("#autocomplete_" + _elementId);

            fldTextElement.hide();
            fldNumberElement.hide();
            fldSelectionElement.hide();
            fldCuadrasElement.hide();
            fld_autocomplete.hide();

            if(optionId == 1 ){
            }
            else if(optionId == 2 ){
                fld_autocomplete.show();
                lblAutocompleteElement.text("Servicio");
                let _options = [{"id":1,"name":"101"},{"id":2,"name":"101c"},{"id":3,"name":"102"},{"id":4,"name":"103"},{"id":5,"name":"104"},{"id":6,"name":"105"},{"id":7,"name":"106"},{"id":8,"name":"107"},{"id":9,"name":"107c"},{"id":10,"name":"108"},{"id":11,"name":"109"},{"id":12,"name":"109N"},{"id":13,"name":"110"},{"id":14,"name":"110c"},{"id":15,"name":"111"},{"id":16,"name":"113"},{"id":17,"name":"113c"},{"id":18,"name":"113e"},{"id":19,"name":"114"},{"id":20,"name":"115"},{"id":21,"name":"116"},{"id":22,"name":"117"},{"id":23,"name":"117c"},{"id":24,"name":"118"},{"id":25,"name":"119"},{"id":26,"name":"120"},{"id":27,"name":"121"},{"id":28,"name":"125"},{"id":29,"name":"126"},{"id":30,"name":"201"},{"id":31,"name":"201e"},{"id":32,"name":"202c"},{"id":33,"name":"203"},{"id":34,"name":"203e"},{"id":35,"name":"204"},{"id":36,"name":"204e"},{"id":37,"name":"204N"},{"id":38,"name":"205"},{"id":39,"name":"205e"},{"id":40,"name":"206"},{"id":41,"name":"206c"},{"id":42,"name":"207e"},{"id":43,"name":"208"},{"id":44,"name":"208c"},{"id":45,"name":"209"},{"id":46,"name":"209e"},{"id":47,"name":"210"},{"id":48,"name":"210v"},{"id":49,"name":"211"},{"id":50,"name":"211c"},{"id":51,"name":"212"},{"id":52,"name":"213e"},{"id":53,"name":"214"},{"id":54,"name":"216"},{"id":55,"name":"217e"},{"id":56,"name":"219e"},{"id":57,"name":"221e"},{"id":58,"name":"223"},{"id":59,"name":"224"},{"id":60,"name":"224c"},{"id":61,"name":"225"},{"id":62,"name":"226"},{"id":63,"name":"227"},{"id":64,"name":"228"},{"id":65,"name":"229"},{"id":66,"name":"230"},{"id":67,"name":"262N"},{"id":68,"name":"264N"},{"id":69,"name":"271"},{"id":70,"name":"301"},{"id":71,"name":"301c"},{"id":72,"name":"301c2"},{"id":73,"name":"301e"},{"id":74,"name":"302"},{"id":75,"name":"302e"},{"id":76,"name":"302N"},{"id":77,"name":"303"},{"id":78,"name":"303e"},{"id":79,"name":"307"},{"id":80,"name":"307c"},{"id":81,"name":"307e"},{"id":82,"name":"308"},{"id":83,"name":"308c"},{"id":84,"name":"313e"},{"id":85,"name":"314"},{"id":86,"name":"315c"},{"id":87,"name":"315e"},{"id":88,"name":"321"},{"id":89,"name":"322"},{"id":90,"name":"323"},{"id":91,"name":"325"},{"id":92,"name":"329"},{"id":93,"name":"345"},{"id":94,"name":"346N"},{"id":95,"name":"348"},{"id":96,"name":"350"},{"id":97,"name":"350c"},{"id":98,"name":"385"},{"id":99,"name":"401"},{"id":100,"name":"401c"},{"id":101,"name":"402"},{"id":102,"name":"403"},{"id":103,"name":"404"},{"id":104,"name":"404c"},{"id":105,"name":"405"},{"id":106,"name":"405c"},{"id":107,"name":"406"},{"id":108,"name":"406c"},{"id":109,"name":"407"},{"id":110,"name":"408"},{"id":111,"name":"408e"},{"id":112,"name":"409"},{"id":113,"name":"410"},{"id":114,"name":"410e"},{"id":115,"name":"411"},{"id":116,"name":"412"},{"id":117,"name":"413c"},{"id":118,"name":"413v"},{"id":119,"name":"414e"},{"id":120,"name":"415e"},{"id":121,"name":"417e"},{"id":122,"name":"418"},{"id":123,"name":"419"},{"id":124,"name":"420e"},{"id":125,"name":"421"},{"id":126,"name":"422"},{"id":127,"name":"423"},{"id":128,"name":"424"},{"id":129,"name":"425"},{"id":130,"name":"426"},{"id":131,"name":"428"},{"id":132,"name":"428c"},{"id":133,"name":"428e"},{"id":134,"name":"429"},{"id":135,"name":"429c"},{"id":136,"name":"430"},{"id":137,"name":"431c"},{"id":138,"name":"431v"},{"id":139,"name":"432N"},{"id":140,"name":"435"},{"id":141,"name":"501"},{"id":142,"name":"502"},{"id":143,"name":"502c"},{"id":144,"name":"503"},{"id":145,"name":"504"},{"id":146,"name":"505"},{"id":147,"name":"506"},{"id":148,"name":"506e"},{"id":149,"name":"506v"},{"id":150,"name":"507"},{"id":151,"name":"507c"},{"id":152,"name":"508"},{"id":153,"name":"509"},{"id":154,"name":"510"},{"id":155,"name":"511"},{"id":156,"name":"513"},{"id":157,"name":"513v"},{"id":158,"name":"514"},{"id":159,"name":"514c"},{"id":160,"name":"515N"},{"id":161,"name":"516"},{"id":162,"name":"517"},{"id":163,"name":"518"},{"id":164,"name":"519"},{"id":165,"name":"541N"},{"id":166,"name":"546e"},{"id":167,"name":"712"},{"id":168,"name":"712N"},{"id":169,"name":"B01"},{"id":170,"name":"B02"},{"id":171,"name":"B02N"},{"id":172,"name":"B03"},{"id":173,"name":"B04"},{"id":174,"name":"B04v"},{"id":175,"name":"B05"},{"id":176,"name":"B06"},{"id":177,"name":"B07"},{"id":178,"name":"B08"},{"id":179,"name":"B09"},{"id":180,"name":"B10"},{"id":181,"name":"B11"},{"id":182,"name":"B12"},{"id":183,"name":"B12c"},{"id":184,"name":"B13"},{"id":185,"name":"B14"},{"id":186,"name":"B15"},{"id":187,"name":"B16"},{"id":188,"name":"B17"},{"id":189,"name":"B18"},{"id":190,"name":"B18e"},{"id":191,"name":"B19"},{"id":192,"name":"B20"},{"id":193,"name":"B21"},{"id":194,"name":"B22"},{"id":195,"name":"B23"},{"id":196,"name":"B24"},{"id":197,"name":"B25"},{"id":198,"name":"B26"},{"id":199,"name":"B27"},{"id":200,"name":"B28"},{"id":201,"name":"B29"},{"id":202,"name":"B30N"},{"id":203,"name":"B31N"},{"id":204,"name":"C01"},{"id":205,"name":"C01c"},{"id":206,"name":"C02"},{"id":207,"name":"C02c"},{"id":208,"name":"C03"},{"id":209,"name":"C03c"},{"id":210,"name":"C04"},{"id":211,"name":"C05"},{"id":212,"name":"C06"},{"id":213,"name":"C07"},{"id":214,"name":"C08"},{"id":215,"name":"C09"},{"id":216,"name":"C10e"},{"id":217,"name":"C11"},{"id":218,"name":"C12"},{"id":219,"name":"C13"},{"id":220,"name":"C14"},{"id":221,"name":"C15"},{"id":222,"name":"C16"},{"id":223,"name":"C17"},{"id":224,"name":"C18"},{"id":225,"name":"C19"},{"id":226,"name":"C20"},{"id":227,"name":"C21N"},{"id":228,"name":"C22"},{"id":229,"name":"D01"},{"id":230,"name":"D02"},{"id":231,"name":"D03"},{"id":232,"name":"D03c"},{"id":233,"name":"D05"},{"id":234,"name":"D07"},{"id":235,"name":"D07c"},{"id":236,"name":"D08"},{"id":237,"name":"D08c"},{"id":238,"name":"D09"},{"id":239,"name":"D09N"},{"id":240,"name":"D10"},{"id":241,"name":"D11"},{"id":242,"name":"D12"},{"id":243,"name":"D13"},{"id":244,"name":"D14"},{"id":245,"name":"D15"},{"id":246,"name":"D16"},{"id":247,"name":"D17"},{"id":248,"name":"D17v"},{"id":249,"name":"D18"},{"id":250,"name":"D20"},{"id":251,"name":"E01"},{"id":252,"name":"E02"},{"id":253,"name":"E03"},{"id":254,"name":"E04"},{"id":255,"name":"E05"},{"id":256,"name":"E06"},{"id":257,"name":"E07"},{"id":258,"name":"E08"},{"id":259,"name":"E09"},{"id":260,"name":"E10"},{"id":261,"name":"E11"},{"id":262,"name":"E12"},{"id":263,"name":"E13"},{"id":264,"name":"E14"},{"id":265,"name":"E15c"},{"id":266,"name":"E16"},{"id":267,"name":"E17"},{"id":268,"name":"E18"},{"id":269,"name":"F01"},{"id":270,"name":"F01c"},{"id":271,"name":"F02"},{"id":272,"name":"F03"},{"id":273,"name":"F03c"},{"id":274,"name":"F05"},{"id":275,"name":"F06"},{"id":276,"name":"F07"},{"id":277,"name":"F08"},{"id":278,"name":"F09"},{"id":279,"name":"F10"},{"id":280,"name":"F11"},{"id":281,"name":"F12"},{"id":282,"name":"F12c"},{"id":283,"name":"F13"},{"id":284,"name":"F13c"},{"id":285,"name":"F14"},{"id":286,"name":"F15"},{"id":287,"name":"F16"},{"id":288,"name":"F18"},{"id":289,"name":"F19"},{"id":290,"name":"F20"},{"id":291,"name":"F23"},{"id":292,"name":"F24"},{"id":293,"name":"F25"},{"id":294,"name":"F25e"},{"id":295,"name":"F26"},{"id":296,"name":"F27"},{"id":297,"name":"F28N"},{"id":298,"name":"F29"},{"id":299,"name":"F30N"},{"id":300,"name":"G01"},{"id":301,"name":"G01c"},{"id":302,"name":"G02"},{"id":303,"name":"G04"},{"id":304,"name":"G05"},{"id":305,"name":"G07"},{"id":306,"name":"G08"},{"id":307,"name":"G08v"},{"id":308,"name":"G09"},{"id":309,"name":"G11"},{"id":310,"name":"G12"},{"id":311,"name":"G13"},{"id":312,"name":"G14"},{"id":313,"name":"G15"},{"id":314,"name":"G16"},{"id":315,"name":"G18"},{"id":316,"name":"G22"},{"id":317,"name":"G23"},{"id":318,"name":"H02"},{"id":319,"name":"H03"},{"id":320,"name":"H04"},{"id":321,"name":"H05"},{"id":322,"name":"H05c"},{"id":323,"name":"H06"},{"id":324,"name":"H07"},{"id":325,"name":"H08"},{"id":326,"name":"H09"},{"id":327,"name":"H12"},{"id":328,"name":"H13"},{"id":329,"name":"H14"},{"id":330,"name":"I01"},{"id":331,"name":"I02"},{"id":332,"name":"I03"},{"id":333,"name":"I03c"},{"id":334,"name":"I04"},{"id":335,"name":"I04c"},{"id":336,"name":"I04e"},{"id":337,"name":"I05"},{"id":338,"name":"I07"},{"id":339,"name":"I08"},{"id":340,"name":"I08c"},{"id":341,"name":"I08N"},{"id":342,"name":"I09"},{"id":343,"name":"I09c"},{"id":344,"name":"I09e"},{"id":345,"name":"I10"},{"id":346,"name":"I10N"},{"id":347,"name":"I11"},{"id":348,"name":"I12"},{"id":349,"name":"I13"},{"id":350,"name":"I14"},{"id":351,"name":"I14N"},{"id":352,"name":"I16"},{"id":353,"name":"I17"},{"id":354,"name":"I18"},{"id":355,"name":"I20"},{"id":356,"name":"I21"},{"id":357,"name":"I22"},{"id":358,"name":"I24"},{"id":359,"name":"I25"},{"id":360,"name":"J01"},{"id":361,"name":"J01c"},{"id":362,"name":"J02"},{"id":363,"name":"J03"},{"id":364,"name":"J04"},{"id":365,"name":"J05"},{"id":366,"name":"J06"},{"id":367,"name":"J07"},{"id":368,"name":"J07c"},{"id":369,"name":"J07e"},{"id":370,"name":"J08"},{"id":371,"name":"J10"},{"id":372,"name":"J11"},{"id":373,"name":"J12"},{"id":374,"name":"J13"},{"id":375,"name":"J13c"},{"id":376,"name":"J14c"},{"id":377,"name":"J15c"},{"id":378,"name":"J16"},{"id":379,"name":"J17"},{"id":380,"name":"J18"},{"id":381,"name":"J18c"},{"id":382,"name":"J19"},{"id":383,"name":"J20"}];
                _this.autocompleteMapObjects.delete('autocomplete_' + _elementProperties.id);
                _this.autocompleteMapElements.set('autocomplete_' + _elementProperties.id, {id:_elementProperties.id, option: _options} );
                _this.initAutocompleteElements();
            }
            else if(optionId == 3 ){
                fldTextElement.show();
                lblTextElement.text("Lugar Origen");
                textElement.val("");
            }
            else if(optionId == 4 ){
                fldSelectionElement.show();
                lblSelectionElement.text("Estación");
                selectionElement.empty();
                let _options = [{"id":1,"name":"5 Pinos"},{"id":2,"name":"Alameda"},{"id":3,"name":"Buin"},{"id":4,"name":"Buin Zoo"},{"id":5,"name":"Freire"},{"id":6,"name":"Graneros"},{"id":7,"name":"Hospital"},{"id":8,"name":"Linderos"},{"id":9,"name":"Lo Blanco"},{"id":10,"name":"Lo Espejo"},{"id":11,"name":"Lo valledor"},{"id":12,"name":"Maestranza"},{"id":13,"name":"Nos"},{"id":14,"name":"PAC"},{"id":15,"name":"Paine"},{"id":16,"name":"Rancagua"},{"id":17,"name":"San Bernardo"},{"id":18,"name":"San Francisco"}];
                selectionElement.append('<option value="-1"></option>');
                for(let next = 0; next < _options.length; next++){
                      selectionElement.append('<option value="' + _options[next].id + '">' +  _options[next].name + '</option>');
                }
                selectionElement.trigger("create");
                selectionElement.selectmenu();
                selectionElement.selectmenu('refresh', true);
            }
            else if(optionId == 5 ){
                fldTextElement.show();
                lblTextElement.text("Línea");
                textElement.val("");
            }
            else if(optionId == 6 ){
            }
            else if(optionId == 7 ){
                fldSelectionElement.show();
                lblSelectionElement.text("Tipo");
                selectionElement.empty();
                let _options = [{"id":1,"name":"Público"},{"id":2,"name":"Privado"}];
                selectionElement.append('<option value="-1"></option>');
                for(let next = 0; next < _options.length; next++){
                    selectionElement.append('<option value="' + _options[next].id + '">' +  _options[next].name + '</option>');
                }
                selectionElement.trigger("create");
                selectionElement.selectmenu();
                selectionElement.selectmenu('refresh', true);
            }
            else if(optionId == 8 ){
                fldSelectionElement.show();
                lblSelectionElement.text("Cómo");
                selectionElement.empty();
                let _options = [{"id":1,"name":"Conductor"},{"id":2,"name":"Acompañante"}];
                selectionElement.append('<option value="-1"></option>');
                for(let next = 0; next < _options.length; next++){
                    selectionElement.append('<option value="' + _options[next].id + '">' +  _options[next].name + '</option>');
                }
                selectionElement.trigger("create");
                selectionElement.selectmenu();
                selectionElement.selectmenu('refresh', true);
            }
            else if(optionId == 9 ){
                fldTextElement.show();
                lblTextElement.text("Cuál");
                textElement.val("");
            }
            if(optionId ){
                lblCuadrasElement.text("Cuadras a Acceso");
                selectionCuadrasElement.empty();
                selectionCuadrasElement.append('<option value="-1"></option>');
                for(let next = 0; next < 10; next++){
                    selectionCuadrasElement.append('<option value="' + (next + 1 ) + '">' + (next + 1 ) + '</option>');
                }
                selectionCuadrasElement.trigger("create");
                selectionCuadrasElement.selectmenu();
                selectionCuadrasElement.selectmenu('refresh', true);
                fldCuadrasElement.show();
            }
        });
        mainApp.utils.forceClosePopup();
        $('#grouping_popup').popup();
        $("#btnAccept").on("click", function(){

            let _selectedId  = $( "#" + _elementId).val();
            if(!_selectedId || _selectedId < 1){
                $("#grouping_popup").popup("close");
                return;
            }
            let _childrenValues = [];

            let _textElementValue               = {id: textElement.val(), text: textElement.val().trim(), label:lblTextElement.text()};
            let _selectionElementValue          = {id:selectionElement.val(), text:$( "#" + selectionElement.attr('id') + " option:selected" ).text(), label:lblSelectionElement.text()};
            let _numberElementValue             = {id:numberElement.val(), text:$( "#" + numberElement.attr('id') + " option:selected" ).text(), label:lblNumberElement.text()};
            let _selectionCuadrasElementValue   = {id:selectionCuadrasElement.val(), text:$( "#" + selectionCuadrasElement.attr('id') + " option:selected" ).text(), label:lblCuadrasElement.text()};
            let _autocompleteElementValue       = {id: autocompleteElement.val(), text: autocompleteElement.val(), label:lblAutocompleteElement.text()};

            let _warningMessage = "";
            if( _selectedId == 1 ){ //Caminata
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 2 ){ // Bus Transantiago
                let _autocompleteObj = _this.autocompleteMapElements.get(autocompleteElement.attr('id'));
                // console.log(_autocompleteElementValue.text.toUpperCase());
                // console.log(_autocompleteElementValue.text.toLowerCase());
                // for (const [key, value] of _autocompleteObj.optionsMap.entries()){
                //     console.log(key + ">>>>>" + value);
                // }

                if(!_autocompleteObj ||
                    !_autocompleteObj.optionsMap ||
                    (!_autocompleteObj.optionsMap.get(_autocompleteElementValue.text.toUpperCase()) &&
                    !_autocompleteObj.optionsMap.get(_autocompleteElementValue.text.toLowerCase()))
                )
                {
                    alert("Por favor, indique un servicio válido");
                    return;
                }

                _childrenValues.push(_autocompleteElementValue);
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 3 ){ // Bus Interprovincial
                if(!_textElementValue.text){
                    alert("Por favor, indique el lugar de origen.");
                    return;
                }
                _childrenValues.push(_textElementValue);
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 4 ){ // Metrotren
                if(!_selectionElementValue.id || _selectionElementValue.id < 0 ){
                    alert("Por favor, indique la estación.");
                    return;
                }
                _childrenValues.push(_selectionElementValue);
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 5 ){ // Taxi Colectivo
                if(!_textElementValue.text){
                    alert("Por favor, indique la línea.");
                    return;
                }
                _childrenValues.push(_textElementValue);
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 6 ){ // Taxi uber
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 7 ){ // Bicicleta/scooter
                if(!_selectionElementValue.id || _selectionElementValue.id < 0 ){
                    alert("Por favor, indique el tipo.");
                    return;
                }
                _childrenValues.push(_selectionElementValue);
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 8 ){ // Automovil
                if(!_selectionElementValue.id || _selectionElementValue.id < 0 ){
                    alert("Por favor, indique cómo.");
                    return;
                }
                _childrenValues.push(_selectionElementValue);
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            else if( _selectedId == 9 ){ // Otro
                if(!_textElementValue.text){
                    alert("Por favor, indique cuál.");
                    return;
                }
                _childrenValues.push(_textElementValue);
                _childrenValues.push(_selectionCuadrasElementValue);
            }
            if(!_selectionCuadrasElementValue.id || _selectionCuadrasElementValue.id < 0 ){
                alert("Por favor, indique el Nº de cuadras.");
                return;
            }

            if(_elementProperties.tmpValues == undefined || !Array.isArray(_elementProperties.tmpValues ) )
            {
                _elementProperties.tmpValues = [];
                _elementProperties.tmpValues.push( {id:$( "#" + _elementId).val(), text:$( "#" + _elementId +" option:selected" ).text(), itemId: mainApp.utils.getUniqueId(), children:_childrenValues});
            }
            else if( Array.isArray(_elementProperties.tmpValues ) )
                _elementProperties.tmpValues.push( {id:$( "#" + _elementId).val(), text:$( "#" + _elementId +" option:selected" ).text(), itemId: mainApp.utils.getUniqueId(), children:_childrenValues})
            $("#grouping_popup").popup("close");
            _this.addGroupingSelectorItems(_elementProperties.tmpValues, _elementId, _groupingContentId);

        });
        $("#btnCancel").on("click", function(){$("#grouping_popup").popup("close");});
        try{$("#grouping_popup").popup("close");this.hidePopupModal();}catch(err){console.log(err.message);}
        setTimeout(function(){$('#grouping_popup').trigger("create");$("#grouping_popup").popup("open", { transition: "slideup"   });}, 300);
    }
    addGroupingSelectorItems(_items, _elementId, _groupingContentId ){
        console.log("addGroupingSelectorItems");
        let _elementProperties = mainApp.elementsMap.get(_elementId);
        console.log(JSON.stringify(_elementProperties));
        $("#" + _groupingContentId ).html("");
        console.log($("#" + _groupingContentId ));
        //alert(_groupingContentId);

        if( !Array.isArray( _items ) ) return;
        let _content = "";
        for(let _next = 0; _next < _items.length; _next++){
            _content += '<p style="font-size:0.9em" id="' + _items[_next].itemId + '">';
            _content += '<b>' + (_next + 1) + '-</b> <span style="text-decoration: underline">' + _items[_next].text + '</span>&nbsp;|&nbsp;';
            for( let _nextChild = 0; _nextChild < _items[_next].children.length; _nextChild++){
                _content += '<b>' + _items[_next].children[_nextChild].label + ':</b> ' + _items[_next].children[_nextChild].text + '&nbsp;|&nbsp;';
            }
            //_content += '&nbsp;&nbsp;&nbsp;<a style="font-size:1.5em;color:red" href="#" onclick="alert(1)">X</a>';
            _content += '&nbsp;&nbsp;&nbsp;<a style="font-size:0.7em;color:red" href="#"  onclick="mainApp.guiBuilder.deleteGroupingSelectorItem(\'' + _items[_next].itemId + '\', \'' + _elementId + '\', \'' + _groupingContentId + '\',' + (_next + 1) + ' )">Eliminar</a>';
            //_content = _content.substr(0, _content.length-7);
            _content +=  '</p>';
        }
        $("#" + _groupingContentId ).html(_content);
    }
    deleteGroupingSelectorItem(_itemId, _elementId, _groupingContentId, _itemNumber ){
        var html = this.getConfirmationPopup("?", '<label>¿Desea eliminar el item Nº ' + _itemNumber + '?</label>');
        mainApp.utils.forceClosePopup();
        let _this = this;
        $("#" + _groupingContentId).append(html).find("#mypDialog").enhanceWithin().popup({
            afterclose: function (event, ui) {
                $("#mypDialog").remove();
            }
        }).popup("open", {
            transition: "flow",
            positionTo: "window"
        });
        $("#mypDialog").on("click", "#btnPopOK", function(){
            //alert("here");
            let _elementProperties = mainApp.elementsMap.get(_elementId);
            for(let _next = 0; _next < _elementProperties.tmpValues.length; _next++){
                //alert(_itemId);
                //alert(_elementProperties.tmpValues[_next].itemId);
                if( _elementProperties.tmpValues[_next].itemId != _itemId )continue;
                _elementProperties.tmpValues.splice(_next, 1);
                break;
            }
            console.log("_elementProperties.tmpValues");
            console.log(JSON.stringify(_elementProperties.tmpValues));
            _this.addGroupingSelectorItems(_elementProperties.tmpValues, _elementId, _groupingContentId);
            $("#mypDialog").popup("close");
        });
    }
    _getRadioButtonElement(_elementProperties){
        let _elementId = _elementProperties.id + '_';
        //let _template = '<div id="lbl_above_control_'+ _elementProperties.id +'">{LABEL_ABOVE_CONTROL}</div>';
        //_template += '<div id="{FIELD_ID}" class="ui-field-contain" data-role="fieldcontain"> <label id="{LABEL_ID}" for="'+_elementId+'">{LABEL}</label><fieldset id="'+_elementId+'" data-role="controlgroup" data-type="horizontal">{OPTIONS}</fieldset></div>';

        //let _template = '<div id="{FIELD_ID}" class="ui-field-contain" data-role="fieldcontain"> <label id="{LABEL_ID}" for="'+_elementId+'">{LABEL}</label><fieldset id="'+_elementId+'" data-role="controlgroup" data-type="horizontal">{OPTIONS}</fieldset></div>';
        let _template = '<div id="{FIELD_ID}" class="ui-field-contain" data-role="fieldcontain"> <fieldset id="'+_elementId+'" data-role="controlgroup" data-type="horizontal"><legend id="{LABEL_ID}" for="'+_elementId+'">{LABEL}</legend>{OPTIONS}</fieldset></div>';
        let _options = '';
        let _elementChoiceId = null;
        let _checked = null;
        let _onclick = null;
        for(let next = 0; next < _elementProperties.option.length; next++)
        {
            _onclick = "";
            //_elementChoiceId = _elementProperties.option[next].id + "_" + next;
            _checked = (_elementProperties.option[next].selected) ? "checked" : "";
            _elementChoiceId = _elementProperties.id + "_" + next;
            if( _elementProperties.childrenComponent )
                _onclick = 'mainApp.onChangeRadio(this,\'' + _elementProperties.id + '\',' + _elementProperties.option[next].id + ')';
            _options += '<input class="_RadioButton" onclick="' + _onclick + '" type="radio" name="'+_elementProperties.id+'" id="'+ _elementChoiceId +'" value="'+_elementProperties.option[next].id+'" text="'+_elementProperties.option[next].name+'" ' +_checked + '>';
            _options += '<label style="font-size:1em" for="'+_elementChoiceId+'">' + _elementProperties.option[next].name + '</label>';

        }
        _template = this._setGenericAttributes(_elementProperties, _template);
        _template = _template.replace("{OPTIONS}", _options );
        //if( _elementProperties.childrenComponent || _elementProperties.withDescription )
        //{
        //    $(":input[name= '"+_elementProperties.id+"']").on('change', function(){ alert("DO SOMETHING");});

        //    // $(document).on('change', "#" +  _elementProperties.id, function () {mainApp.onChangeSelector(_elementProperties.id,this.value)});
        //}
        console.log("_template");
        console.log(_template);
        return _template;
    }
    getNumberElement(_elementProperties){
        let _template = '<div id="{FIELD_ID}" data-role="fieldcontain" {STYLE_V}> <label id="{LABEL_ID}" for="{ELEMENT_ID}" >{LABEL}</label><input type="number" name="{ELEMENT_ID}" id="{ELEMENT_ID}" value="{INPUT_VALUE}" {READONLY}/></div>'
        _template = this._setGenericAttributes(_elementProperties, _template);
        let _value = "";
        if( _elementProperties.value )              _value = _elementProperties.value;
        else if( _elementProperties.defaultValue )  _value = _elementProperties.defaultValue;
        return _template.replace("{INPUT_VALUE}", _value );
    }
    getButtonElement(_elementProperties){
        let _template = '<button  id="{ELEMENT_ID}"  {STYLE} data-icon="{DATA-ICON}">{LABEL}</button>';
        _template =  this._setGenericAttributes(_elementProperties, _template);

        $(document).off('click', "#" + _elementProperties.id)
        if(_elementProperties.action) $(document).on('click', "#" +  _elementProperties.id, function () {mainApp.clickOnButton(_elementProperties,this)});
        if(_elementProperties.action) $(document).on('taphold', "#" +  _elementProperties.id, function () {mainApp.tapHoldOnButton(_elementProperties,this)});
        console.log("Button");
        console.log(_template);
        return _template;
    }
    buildResearchsList()
    {
        let _objs = filesHandler.getEstudiosList();
        let html = '<ul data-role="listview" data-inset="true" id="estudiosList">';
        if(_objs == null || _objs.length < 1 )
            html += '<li href="#" id="no-results" >No se encontraron estudios.</li>';
        else
            for(let next = 0; next < _objs.length; next++)html += '<li id="' + _objs[next].id + '"><a href="#">' + _objs[next].name + '</a></li>';
        html += '</ul>';
        let _curr = this;
        $("#estudiosContainer").html(html);
        $.mobile.changePage("#pag_estudios", { transition: "slide" });
        $('#estudiosList').listview();
        $('#estudiosList').on('click', 'li', function() {if(this.id == "no-results" || !this.id)return;_curr.showPopupModal();mainApp.currentEstudio = filesHandler.getEstudiosMap().get(this.id);filesHandler.procesarCampanias(mainApp.currentEstudio).then(function(_result){mainApp.buildCampanias()});});
    }
    buildCampaignesList()
    {
        let _camps = filesHandler.getCampaniasList();
        let html = '<ul data-role="listview" data-inset="true" id="campaniasList">';
        if(_camps == null || _camps.length < 1 )
            html += '<li href="#" id="no-results" >No se encontraron campañas.</li>';
        else
            for(let next = 0; next < _camps.length; next++)html += '<li id="' + _camps[next].id + '"><a href="#">' + _camps[next].name + '</a></li>';
        html += '</ul>';
        let _curr = this;
        $("#campaniasContainer").html(html);
        $.mobile.changePage("#pag_campanias", { transition: "slide" });
        _curr.hidePopupModal();
        $('#campaniasList').listview();
        $('#campaniasList').on('click', 'li', function(){if(this.id == "no-results" || !this.id )return;_curr.showPopupModal();mainApp.currentCampania =  filesHandler.getCampaniasMap().get(this.id);mainApp.buildCampaign(mainApp.CAMPAIGN_SECTION_HEADER);});
    }
    buildElement(_element, _containerDivName, _addInMap = true ){
        let _html = "";
        if(_element.type == this.ELEMENT_TEXT){
            _html += this.getTextElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        if(_element.type == this.ELEMENT_NUMBER){
            _html += this.getNumberElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_SELECTION){
            this._setDataByParentInHeader(_element);
            _html += this.getSelectorElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_GROUPING_SELECTORS){
            _html += this.getGroupingSelectors(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_BUTTON){
            _html += this.getButtonElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_MAP){
            _html += this.getMapElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_IMAGE){
            this._setDataByParentInHeader(_element);
            _html += this.getImageElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_OPTIONS_WITH_IMAGES){
            _html += this.getOptionsWithImagesElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_SEPARATOR){
            _html += this.getSeparatorElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_LIST)
        {
            for(let next = 0; next < mainApp.currentMedicion.header.length; next++)
            {
                if(  mainApp.currentMedicion.header[next].id == _element.parentComponent &&
                     mainApp.currentMedicion.header[next].userValue &&
                     mainApp.currentMedicion.header[next].userValue.id == _element.optionId)
                {
                    mainApp.divElementsMap.get(_containerDivName).push(_element);
                    for(let next2 = 0; next2 < _element.element.length; next2++)
                    {
                        mainApp.elementsMap.set(_element.element[next2].id, _element.element[next2]);
                        _html += this.buildElement(_element.element[next2], _containerDivName, false);
                    }
                    break;
                }
            }
        }
        return _html;
    }
    _setDataByParentInHeader(_element){
        console.log("_setDataByParentInHeader");
        console.log(_element.id);
        if(! mainApp.currentMedicion || !_element.parentComponent || _element.optionsByParent === undefined || !_element.optionsByParent || _element.optionsByParent.length < 1) return;
        let _objectsArray = [];
        _objectsArray = _objectsArray.concat( mainApp.currentMedicion.header);
        if(mainApp.currentMedicion.summary && mainApp.currentMedicion.summary.elements  ) _objectsArray = _objectsArray.concat( mainApp.currentMedicion.summary.elements );
        console.log(JSON.stringify(_objectsArray));
        for(let next = 0; next <_objectsArray.length; next++)
        {
            if( _objectsArray[next].id == _element.parentComponent    &&
                _objectsArray[next].userValue                         &&
                _objectsArray[next].userValue.id                      &&
                _objectsArray[next].userValue.id > 0)
            {
                for(let next2 = 0; next2 < _element.optionsByParent.length; next2++ ){
                    if(_element.optionsByParent[next2].parentId != _objectsArray[next].userValue.id ) continue;
                    _element.option = _element.optionsByParent[next2].options;
                    _element.img = _element.optionsByParent[next2].img;
                    console.log("Hay Opciones...." + _element.id);
                    return;
                }
            }
        }
    }

    _setGenericAttributes(_elementProperties, _template){
        let _styleComponent     = "";
        let _styleVisibility    = "";
        if(_elementProperties.customStyle)
        {
            _styleComponent = 'style="' + _elementProperties.customStyle + '"';
        }
        else {
            if(_elementProperties.bgcolor) _styleComponent += "background-color: " + _elementProperties.bgcolor;
            if(_elementProperties.visible !== undefined && !_elementProperties.visible) _styleVisibility += "display:none";
            if( _styleVisibility != "" ) _styleVisibility = 'style="' + _styleVisibility + '"';
            if( _styleComponent != "" ) _styleComponent = 'style="' + _styleComponent + '"';
        }
        return _template.replace("{FIELD_ID}", "fld_" + _elementProperties.id )
                        .replace("{LABEL}", this._getLabel(_elementProperties))
                        .replace("{LABEL_ABOVE_CONTROL}", this._getLabel(_elementProperties))
                        .replace(new RegExp("{ELEMENT_ID}", "g"),  _elementProperties.id )
                        .replace("{READONLY}", ((_elementProperties.editable !== undefined && _elementProperties.editable ) ? "" : "readonly") )
                        .replace("{STYLE}", _styleComponent )
                        .replace("{STYLE_V}", _styleVisibility )
                        .replace("{DATA-ICON}", ((_elementProperties.dataIcon) ? _elementProperties.dataIcon : "") )
                        ;

    }
    _getLabel(_elementProperties){
        let _label = "";
        if(!_elementProperties.label) return _label;
        _label = ( _elementProperties.required != undefined && _elementProperties.required && _elementProperties.type != this.ELEMENT_BUTTON) ? _elementProperties.label + " (*)" : _elementProperties.label;
        return _label;
    }
    showPopupModal()
    {
        console.log("showPopupModal");
        this.hidePopupModal();
        $("body").append('<div class="ui-loader-background"/>');
        $.mobile.loading( "show", {
                text: "ddddd",
                textVisible: false,
                theme: "e",
                textonly: false,
                html: ""
        });
    }
    hidePopupModal()
    {
        $(".ui-loader-background").remove();
        $.mobile.loading( "hide" );
    }
    hideMapPopup()
    {
        $("#map_popup").hide();
    }
    buildDeleteMeasurementButton( id = "deleteButton" )
    {
        let _element = {id: id, type: this.ELEMENT_BUTTON, label: "ELIMINAR MEDICIÓN", action: mainApp.DELETE_MEASUREMENT_ACTION, bgcolor: "#ff3333;text-shadow:0px 0px 0px #fff"};
        return  this.getButtonElement(_element);
    }
    buildEndMeasurementButton( id = "endButton" )
    {
        let _element = {id: id, type: this.ELEMENT_BUTTON, label: "TERMINAR MEDICIÓN", action: mainApp.END_MEASUREMENT_ACTION, bgcolor: "#33cc33;text-shadow:0px 0px 0px #fff"};
        return  this.getButtonElement(_element);
    }
    buildStartMeasurementButton( id = "startButton" )
    {
        let _element = {id: id, type: this.ELEMENT_BUTTON, label: "INICIAR MEDICIÓN", action: mainApp.START_MEASUREMENT_ACTION, bgcolor: "#33cc33;text-shadow:0px 0px 0px #fff"};
        return  this.getButtonElement(_element);
    }
    buildResume(_element, _measurement, _containerDivName, _addInMap = true){
        let _html = "";
        if(_element.type == this.ELEMENT_TEXT){
            if(!_element.value) _element.value = "";
            _element.value = (_element.userValue != null) ? _element.userValue.text : _element.value;
            _html += this.getTextElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);

        }
        else if(_element.type == this.ELEMENT_NUMBER){
            if(!_element.value) _element.value = null;
            _element.value = (_element.userValue != null) ? _element.userValue.text : _element.value;
            _html += this.getNumberElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);

        }
        else if(_element.type == this.ELEMENT_SELECTION){
            this._setDataByParentInHeader(_element);
            if(_element.userValue != null && _element.userValue.id && _element.option){
                if(typeof _element.userValue.id == "object")
                {
                    for(let next = 0; next < _element.option.length; next++){
                        for(let next2 = 0; next2 < _element.userValue.id.length; next2++)
                            if(_element.option[next].id == _element.userValue.id[next2] ) _element.option[next].selected = true;
                    }
                }
                else {
                    for(let next = 0; next < _element.option.length; next++){
                        if(_element.option[next].id != _element.userValue.id ) continue;
                         _element.option[next].selected = true;
                         break;
                    }
                }
            }
            _html += this.getSelectorElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_GROUPING_SELECTORS){
            _html += this.getGroupingSelectors(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_BUTTON){

            if (_measurement.summary != null && _measurement.summary.mapCounter != null ) {
                mainApp.contadorMap = _measurement.summary.mapCounter;
            }
            let _myCounter = mainApp.contadorMap[_element.id];
            _element.label = (_myCounter) ? _myCounter.textoBoton + " (" + _myCounter.contador + ")": _element.label ;
            _html += this.getButtonElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_MAP){
            if(!_element.value) _element.value = null;
            _element.value = (_element.userValue != null) ? _element.userValue.text : _element.value;
            _html += this.getMapElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_IMAGE){
            if(!_element.value) _element.value = null;
            _element.value = (_element.userValue != null) ? _element.userValue.text : _element.value;
            this._setDataByParentInHeader(_element);
            _html += this.getImageElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_OPTIONS_WITH_IMAGES){
            if(!_element.value) _element.value = null;
            _element.value = (_element.userValue != null) ? _element.userValue.text : _element.value;
            _html += this.getOptionsWithImagesElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_SEPARATOR){
            _html += this.getSeparatorElement(_element);
            if(_addInMap) mainApp.divElementsMap.get(_containerDivName).push(_element);
        }
        else if(_element.type == this.ELEMENT_LIST){
            for(let next = 0; next < _measurement.header.length; next++)
            {
                if( _measurement.header[next].id == _element.parentComponent &&
                    _measurement.header[next].userValue &&
                    _measurement.header[next].userValue.id == _element.optionId)
                {
                    mainApp.divElementsMap.get(_containerDivName).push(_element);
                    for(let next2 = 0; next2 < _element.element.length; next2++)
                    {
                        mainApp.elementsMap.set(_element.element[next2].id, _element.element[next2]);
                        _html += this.buildResume(_element.element[next2], _measurement, _containerDivName, false);
                    }
                    break;
                }
            }
        }
        return _html;

    }
    menu()
    {
        $('#pag_estudios_menu').show();
        $('#pag_campanias_menu').show();
        $('#pag_medicionHeader_menu').show();
        $('#pag_medicionDetail_menu').show();
        //filesHandler._processElementsOffline();
        filesHandler.getUnsentList()
        .then(function(_myLists){
            let _response = null;
            let _myList =  _myLists.objectsLits;
            let _myEntries =  _myLists.entriesList;
            let _color = "green";
            let _visible = "none";
            for(let _next = 0; _next < _myList.length; _next++)
            {
                if( _myList[_next].sent != null || !filesHandler._checkForElementsOffline( _myList[_next])) continue;
                //_visible = "block";
                _color = "red";
                break;
            }
            if(_color)
            {
                $('#pag_estudios_menu').css('background-color', _color);
                $('#pag_campanias_menu').css('background-color', _color);
                $('#pag_medicionHeader_menu').css('background-color', _color);
                $('#pag_medicionDetail_menu').css('background-color', _color);
            }
        });
    }
    isRadioButton(_myElement)
    {
        // if( (   _myElement.option &&
        //         _myElement.option.length == this.OPTIONS_NUMBER_RADIO_BUTON &&
        //         !_myElement.multipleChoice && (_myElement.parentComponent === undefined || !_myElement.parentComponent)
        //     ) || (_myElement.radioButton !== undefined && _myElement.radioButton )
        // ) return true;
        if( _myElement.radioButton !== undefined && _myElement.radioButton ) return true;
        return false;
    }
    getElementValue(_myElement)
    {
        let jqElement = $("#" + _myElement.id);
        console.log("getElementValue>>>>>_myElement.id");
        console.log(_myElement.id);
        let _value = {id:null, text:null};

        if( _myElement.type == this.ELEMENT_SELECTION )
        {
            //if( _myElement.option && _myElement.option.length == this.OPTIONS_NUMBER_RADIO_BUTON && !_myElement.multipleChoice  && (_myElement.parentComponent === undefined || !_myElement.parentComponent) )
            if(this.isRadioButton(_myElement))
            {
                if($("[name='"+ _myElement.id +"']:checked").val() !== undefined)   _value = {id:$("[name='"+ _myElement.id +"']:checked").val(), text:$("[name='"+ _myElement.id +"']:checked").attr("text")} ;
            }
            else if( _myElement.autocomplete !== undefined && _myElement.autocomplete && !_myElement.multipleChoice )
            {
                if(jqElement.val() != undefined &&  jqElement.val().trim() != "")
                    _value =  {id:null, text:(jqElement.val() == undefined) ? null : jqElement.val().trim()};
            }
            else if( _myElement.multipleChoice ) {
                if(jqElement.val() !== undefined && jqElement.val() != null && jqElement.val() != "null" && jqElement.val() != ""  ) {
                    //_value = {id:jqElement.val(), text:$( "#" + _myElement.id +" option:selected" ).text()}
                    let _myValues = [];
                    let _myTexts = "";
                    jqElement.val().map((item)=>{if(item > 0 ) _myValues.push(item)});
                    $('#' +_myElement.id+' option:selected').toArray().map((item) => {if(item.text.length > 0 ) _myTexts += item.text + ","});
                    _value = {id:_myValues, text:_myTexts.substr(0, _myTexts.length-1)}
                }
            }
            else if( jqElement.val() != null && jqElement.val() != "" && jqElement.val() >= 0 ) _value =  {id:jqElement.val(), text:$( "#" + _myElement.id +" option:selected" ).text()};

        }
        else if( _myElement.type == this.ELEMENT_MAP ){
            if( jqElement.val() != null && jqElement.val() && jqElement.val().trim() != ""  ) _value =  {id:null, text:jqElement.val().trim()};
        }
        else if( _myElement.type == this.ELEMENT_IMAGE ){
            if( jqElement.val() != null && jqElement.val() != "" && jqElement.val() >= 0 ) _value =  {id:jqElement.val(), text:$( "#" + _myElement.id +" option:selected" ).text()};
        }
        else if( _myElement.type == this.ELEMENT_OPTIONS_WITH_IMAGES ){
            //En Build resumeno se puede setear el id. Se podrán usar campos personalizados?
            //if( jqElement.val() != null && jqElement.val() != "" ) _value =  {id:jqElement.attr('optionsWithImagesOptionId'), text:jqElement.val()};
            if( jqElement.val() != null && jqElement.val() != "" ) _value =  {id:null, text:jqElement.val()};
        }
        else if( _myElement.type == this.ELEMENT_GROUPING_SELECTORS )
        {
            let customSelection = _me.elementsMap.get(_myElement.id);
            console.log("JSON.stringify(customSelection)");
            console.log(JSON.stringify(customSelection));
            if( customSelection.tmpValues != undefined )
            {
                _value = customSelection.tmpValues;
                _textValue = '';
                for(let _next = 0; _next < _value.length; _next++ ){
                    _textValue += (_next + 1 ) + '- ' +_value[_next].text + ", ";
                    if( !Array.isArray( _value[_next].children) ) continue;
                    for(let _nextChild = 0; _nextChild < _value[_next].children.length; _nextChild++ ){
                        _textValue += _value[_next].children[_nextChild].label + ': ' + _value[_next].children[_nextChild].text + ', ';
                    }
                    _textValue = _textValue.substr(0, _textValue.length-2) + "<br>";
                }
                customSelection.tmpTextValue = _textValue;
            }

            //if( jqElement.val() != null && jqElement.val() != "" && jqElement.val() >= 0 ) _value =  {id:jqElement.val(), text:$( "#" + _myElement.id +" option:selected" ).text()};
        }
        else if(_myElement.type == this.ELEMENT_NUMBER ){
            if(jqElement.val() != null && jqElement.val() != "" && jqElement.val() >= 0)
                _value =  {id:null, text:jqElement.val()};
        }
        else
            _value =  {id:null, text:(jqElement.val() == undefined) ? null : jqElement.val().trim()};
        return _value;
    }
    menuOptions(_menuElement)
    {
        console.log("_menuElement>>>>" + _menuElement.id);
        let parts = _menuElement.id.split("_");
        if(parts[0] != "pag" || parts[parts.length - 1 ] != "menu") return;
        let _synchronizeMenuId = "synchronize_menu_id";
        let _sentMeasurementMenuId = "sent_measurement_menu_id";
        let _menuOptions = '';
        filesHandler.getMiscInfo()
            .then(_info=>{
                let _dateTime = "";
                if(_info && _info.synchronize.timestamp != null ) _dateTime = "(Última: " + mainApp.utils.getformatedDateTime(new Date(_info.synchronize.timestamp)) + ")";
                _menuOptions += '<li id="' + _synchronizeMenuId + '"><a href="#">Sincronizar ' + _dateTime + '</a></li>';
                Promise.resolve(true)
                })
            .then(_result => {
                filesHandler.getUnsentList()
                .then(function(_myLists){
                    console.log("length" + _myLists.objectsLits.length);
                    if( _myLists && _myLists.objectsLits && _myLists.objectsLits.length > 0  )
                    {
                        let counter = 0;
                        for(let _next = 0; _next < _myLists.objectsLits.length; _next++) if( _myLists.objectsLits[_next].sent == null && filesHandler._checkForElementsOffline( _myLists.objectsLits[_next] )) counter++;
                        if( counter > 0 ) _menuOptions += '<li  id="' + _sentMeasurementMenuId + '"><a href="#" style="font-color:red;color:red">Enviar medición (' + counter + ')</a></li>';
                    }



                    let _myContainer =  "#" + parts[0] + "_" + parts[1];
                    let html = '<div data-role="popup" id="popupMenu" data-theme="b">' +
                                    '<div data-role="header"><h1>OPCIONES</h1><a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a></div>'+
                                    '<ul data-role="listview" id="listViewMenu" data-inset="true" style="min-width: 210px;" data-theme="a">'+
                                        _menuOptions  +
                                    '</ul>'+
                                '</div>';
                    $(_myContainer).append(html);
                    $(_myContainer).find("#popupMenu").enhanceWithin().popup({
                        afterclose: function (event, ui) {
                            $("#popupMenu").remove();
                        }
                    }).popup("open", {
                        transition: "flow",
                        positionTo: "window"
                    });
                    $('#listViewMenu').on('click', 'li', function() {
                        if(!mainApp.utils.hasConnection()){
                            mainApp.guiBuilder.hidePopupModal();$("#popupMenu").popup("close");
                            mainApp.checkConnection();
                            return;
                        }
                        if( this.id == _sentMeasurementMenuId )
                        {
                            mainApp.guiBuilder.showPopupModal();
                            filesHandler.sendToServer();
                            $("#popupMenu").popup("close");
                        }
                        else if( this.id == _synchronizeMenuId )
                        {
                            mainApp.guiBuilder.showPopupModal();
                            $("#popupMenu").popup("close");
                            filesHandler.synchronize()
                                .then(_result => {
                                     mainApp.guiBuilder.hidePopupModal();
                                     $("#popupMenu").popup("close");
                                    })
                        }
                        setTimeout(function(){ mainApp.guiBuilder.hidePopupModal();$("#popupMenu").popup("close");mainApp.guiBuilder.menu();}, 3000);
                    })
                })
            })
    }
    initAutocompleteElements(){
        console.log("initAutocompleteElements");
        console.log(this.autocompleteMapElements.size);
        if( this.autocompleteMapElements.size < 1 ) return;
        for (let [_id, _element] of this.autocompleteMapElements) {
            // console.log("this.autocompleteMapObjects.get(_id)");
            // console.log(_id);
            // console.log(this.autocompleteMapObjects.get(_id));
            if(typeof this.autocompleteMapObjects.get(_id) !== "undefined" ) continue;
            _element.optionsMap = new Map();
            if(_element.option != undefined && _element.option.length > 0){
                for(let next = 0; next < _element.option.length; next++){
                    _element.option[next].label = _element.option[next].name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
                    _element.option[next].value = _element.option[next].label;
                    _element.optionsMap.set(_element.option[next].value, _element.option[next].id);
                    //this.autocompleteMapValidValues.set();
                }

            }
            this.autocompleteMapObjects.set(_id, new Awesomplete(document.getElementById(_id), {
                                                                                                 list:_element.option,
                                                                                                 minChars: 1,
                                                                                                 maxItems: 50,
                                                                                                 filter: Awesomplete.FILTER_STARTSWITH,
                                                                                                 sort: (a, b) => {return a.id < b.id ? -1 : 1;}	}));
        }
    }
}
