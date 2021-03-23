const UID = require("../utils/UID");
const Contract = require("./Contract");
const Response = require("./Response");
const Event = require("./Event");

module.exports = class Broker{
    constructor(service){
        this.__service  = service;
        this.__managed=false;
        this.__uid = new UID();
        this.__contracts = new Map();
        this.__manage();
    }
    __manage(){
        if(this.__managed) return;
        const service = this.__service;
        service.on("connected",(id)=>this.__onServiceStarted(id))
        service.on("message",(msg,id)=>this.__onServiceMessage(msg,id))
        service.on("closed",(reason,id)=>this.__onServiceClosed(reason,id))

        this.__managed= true;

    }
    __onServiceStarted(id){
        console.log("browser connected:"+id);
    }
    __onServiceMessage(msg,id){
        //console.log(`msg from browser[${id}]:${msg.substring(0,20) + "..."}`);
        const payload = JSON.parse(msg);
        const typeKey = Object.keys(payload)[0];

        switch (typeKey) {
            //Event
            case "e":
                const evt = new Event(payload["e"]);
                console.log("we have an event")
                break;
            case "ContractResponse":
                const response = new Response(payload["ContractResponse"])
                this.__solveContractResponse(response);
                //console.log("we have a contract response")
            default:
                break;
        }
        //let ue = new UnsolicitedEvent(msg);
        //console.log(ue)
        //we need to detect if contract respons or event
    }

    __onServiceClosed(reason,id){
        console.log(`browser[${id}] closed! reason:${reason}`);
    }
    __solveContractResponse(response){
        if (this.__contracts.has(response.id)){
            let contract = this.__contracts.get(response.id);
            contract.response = response;
            
            contract.honor();
            this.__contracts.delete(response.id)

        }else{
            console.log("Not Implemented > contract not found");
        }
    }

    async call(clientId, remoteHandler, args=null, options){
            const nextId = this.__uid.next();
            let contract = new Contract(nextId,remoteHandler,args);
            this.__contracts.set(nextId,contract)

            try {
                this.__service.sendTo(clientId,contract.toStream())
                const honored = await contract.honoring();

                if(!honored)
                    return  new Response(nextId)
                    .setError(
                        `The client's[${clientId}] remote handler(${remoteHandler}) 
                        failed to return on time!`
                    );
                
                return contract.response;
                
            } catch (err) {
                return new Response(nextId)
                .setError(
                    `Unhandled client[${clientId}] error for handler (${remoteHandler})! \n
                     Message:${err.message}`
                );    
            }
    }
}