class Utils {
    constructor(locationEnabled = true) {
        this.nullPosition = {lat:null, lon:null, error:null, timestamp:null};
        this.position = null;
    }
    setPosition(){
        let _position = {lat:null, lon:null, error:null, timestamp:null};
        let watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 15000 });
        let _me = this;
        function onSuccess(position) {
            _position.lat = position.coords.latitude.toString();
            _position.lon = position.coords.longitude.toString();
            _position.timestamp = position.timestamp;
            _me.position = _position;
        }
        function onError(error) {
             _position.error = error.message;
            _me.position = _position;
            console.log(error.message);
        }

    }
    getPosition(){
        return this.position;
    }
    writeLog(_log){
        console.log(_log);
    }
    hasConnection()
    {
        if( navigator.connection.type == Connection.NONE ) return false;
        return true;
    }
    getDatenumber(_number){
            if(_number < 10 ) _number = "0" + _number;
        return _number;
    }
    getCurrentDate(){
        let _date = new Date();
        // return _date.getDate() + "-" + (_date.getMonth() + 1) + "-" + _date.getFullYear();
         return this.getDatenumber(_date.getDate()) + "-" + this.getDatenumber((_date.getMonth() + 1)) + "-" + _date.getFullYear();
    }
    getCurrentHour(){
        let _date = new Date();
        // return _date.getHours() + ":" + _date.getMinutes() + ":" + _date.getSeconds();
        return this.getDatenumber(_date.getHours()) + ":" + this.getDatenumber(_date.getMinutes()) + ":" + this.getDatenumber(_date.getSeconds());
    }
    getUtcIsoDateTime(_date = null )
    {
        if(!_date)_date = new Date();
        try { return _date.toISOString();} catch (err) {console.log(err.message);return null};
    }
    getUtcIsoDateTimeFromTime(_timeInMillis)
    {
        return this.getUtcIsoDateTime(new Date(_timeInMillis));
    }
    getformatedDateTime(_date){
        return this.getDatenumber(_date.getDate()) + "-" + this.getDatenumber((_date.getMonth() + 1)) + "-" + _date.getFullYear().toString().substr(-2) + " " +this.getDatenumber(_date.getHours()) + ":" + this.getDatenumber(_date.getMinutes());
    }
    forceClosePopup()
    {
        try {
                $.mobile.popup.active = null;
                delete $.mobile.popup.active;
            } catch (e) {}
    }
    getUniqueId(){
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    getJsonfileAsObject(_file){
        return new Promise( (resolve, reject) =>{
            $.getJSON(_file, function(data) {resolve(data)});
        })
    }
    isNumeric(_value){
        return $.isNumeric( _value );
    }
    getCoordinatesFromString(_coordinates){
        let _returnValue = {lat:null, lon:null}
        if(!_coordinates) return _returnValue;
        let _parts = _coordinates.split(",");
        if(!mainApp.utils.isNumeric(_parts[0]) || !mainApp.utils.isNumeric(_parts[1])) return _returnValue;
        _returnValue.lat = Number(_parts[0].trim());
        _returnValue.lon = Number(_parts[1].trim());
        return _returnValue; 
    }
}
