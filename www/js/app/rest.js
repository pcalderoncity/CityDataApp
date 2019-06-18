class RestClient {
    constructor(_config) {
        this._restUri   = _config.REST_URI;
        this._wsUri     = _config.WS_MAP_COORDINATES;
        this.utils      = new Utils();
    }
    get(_operation){
        return this._execute(_operation, null);
    }

    post(_operation, _data){
        //return Promise.resolve({id:1, response:null})
        console.log(JSON.stringify(_data));
        let _options = { method: 'POST', body: JSON.stringify(_data), headers:{'Content-Type': 'application/json'}};
        //return Promise.resolve({id:1, response:null});
        return this._execute(_operation, _options);
    }
    _getCoordinatesFromGmapLink(_offlineItems){
        let _myPromises = [];
        let _cur = this;
        for(let _item = 0; _item < _offlineItems.length; _item++ ){
            console.log("esperando..........");
            _myPromises.push(new Promise((resolve, reject) => {
                setTimeout(function() {
                    $.ajax({
                        type: "POST",
                        //url: "http://192.168.2.119/webroot/pcalderon2/ControlOptimo/utiles/coordenadas/coordenadasFromGmapsLink.php",
                        url: _cur._wsUri,
                        //data: {link: '"' +  _offlineItems[_item].value.text + '"' },
                        data: {link: '"' +  _offlineItems[_item].value.text + '"', user: "coordenadas", passw: "31907" },
                        success: function(_response){
                                    console.log("response");
                                    //if( !_response.lat || isNaN(_response.lat) || !_response.lon || isNaN(_response.lon)){
                                    if( !_response.lat || !_cur.utils.isNumeric(_response.lat) || !_response.lon || !_cur.utils.isNumeric(_response.lon)){
                                        resolve(-1);
                                        return;
                                    }
                                    delete _offlineItems[_item].isOffline;
                                    _offlineItems[_item].value.text =  _response.lat + ',' +   _response.lon;
                                    resolve(1);
                                },
                        error: function( jqXHR, textStatus, errorThrown){
                                    console.log("erroe!");
                                    console.log(jqXHR.responseText);
                                    console.log(textStatus);
                                    console.log(errorThrown);
                                    resolve(-1);
                                },
                        timeout: 15000,
                        async:true,
                        dataType : 'json'
                    });

                }, 60000);

            }));
        }
        return Promise.all(_myPromises);
    }
    _execute(_operation, _options){
        return new Promise( (resolve, reject) =>{
            let _url = this._restUri + "/" + _operation;
            console.log(_url);
            console.log(JSON.stringify(_options));
            fetch(_url, _options)
            .then((_resp) => _resp.json())
            .then((_response)=>{console.log("execute>>>>1");resolve({id:1, response:_response})})
            .catch((_error) => {console.log("execute>>>>2");resolve({id:-1, response:_error})})
        })
    }

}

//TODO
/*************TIMEOUT IMPLEMENTATION************
var FETCH_TIMEOUT = 5000;
new Promise(function(resolve, reject) {
    var timeout = setTimeout(function() {
        reject(new Error('Request timed out'));
    }, FETCH_TIMEOUT);
    fetch('https://example.com/request&#39;)
    .then(function(response) {
        clearTimeout(timeout);
        if (response && response.status == 200) return response.json();
        else reject(new Error('Response error'));
    })
    .then(function(responseObject) {
        // process results
        resolve();
    })
    .catch(function(err) {
        reject(err);
    });
})
.then(function() {
    // request succeed
})
.catch(function(err) {
    // error: response error, request timeout or runtime error
});
*******************************************/
