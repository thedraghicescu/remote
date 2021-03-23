module.exports  = class Contract{
    constructor( id,  caller, args = null){
        if(!id) throw new Error("A contract must have an id");
        if(!caller) throw new Error("A contract must have a caller");
        this.id =id;
        this.caller = caller;
        this.args = args;
        this.honored = false;
        this.response =  null;
    }
    honor(){
        this.honored = true;
    }
    toStream(){
        let temp= {
            id:this.id,
            caller:this.caller
        }

        if(this.args!=null) temp.args = this.args;
        return JSON.stringify(temp);
    }
    honoring(frequency=16,timeout=3000){
        return new Promise(resolve=>{
            let interval,expired;
            interval = setInterval(()=>{
                console.log("interval:"+ this.honored)
                if(this.honored){
                    clearInterval(interval);
                    clearTimeout(expired);
                    resolve(true);
                }
                
            },frequency);

            expired = setTimeout(()=>{
                //console.log("timeout:"+ this.honored)
                clearInterval(interval);
                clearTimeout(expired);
                resolve(false)
            },timeout)
        })

    }
}