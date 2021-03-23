module.exports =  class Event{
    constructor(data){
        this.target  = data["t"];
        this.path    = data["p"];
        this.payload = data["d"];
        this.isError = data["e"] ? true : false;
    }
}