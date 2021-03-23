module.exports = class Response{
    constructor(data){
        this.id = data["id"];
        this.result = data["result"];
        this.isError = data["hadError"] ? true :false;
    }
    setError(message){
        this.isError =true;
        this.result = message;
    }
}