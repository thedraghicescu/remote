const UID = require("../utils/UID");
const WebSocket = require('ws');

const breakDisconnectedArgs=function(data){
    let base= [
        
        {
            code:data._closeCode,
            msg:data._closeMessage
        },
        
    ]
    if(!!data._id) base.push(data._id);
    return base;
}

module.exports = class Service{
    constructor(path,singleClient=true){
        this.path = path;
        
        this.server = new WebSocket.Server({ noServer: true })
        this.server.on('connection', (ws)=> {
            this.__clientConnected(ws);
            this.__callSubscribers("connected",[ws._id])
        } );
        
        this.multi = !singleClient;

        if(!singleClient) this.__idGenerator = new UID();

        this.subscriptions =new Map();
        this.connectedClients = new Map();

    }
    __callSubscribers(event,args){
        if(!this.subscriptions.has(event)) return;

        this.subscriptions.get(event).forEach(subscription => subscription(...args))
        
    }
    __clientConnected(ws){
        if(this.multi){
            const nextID  = this.__idGenerator.next();
            ws._id = nextID;
            this.connectedClients.set(nextID,ws)
        };
        
        ws.on("close",()=>this.__handleClientDisconnected(arguments[0]))
        ws.on("message",(message)=>this.__handleClientMessage(message,ws._id))
    }
    __handleClientDisconnected(data){
        const args = breakDisconnectedArgs(data)
        this.__callSubscribers("closed",args)
    }

    __handleClientMessage(msg,id){
       this.__callSubscribers("message",[msg,id])
    }

    on(event,handler){
        if(this.subscriptions.has(event)){
            this.subscriptions.get(event).push(handler)
        }else{
            this.subscriptions.set(event,[handler])
        }
    }
    off(event,handler){
        if(!this.subscriptions.has(event)) return false;
        
        let sub = this.subscriptions.get(event);
        let idx = sub.indexOf(handler);
        if(idx < 0) return false;
        //remove from array
        return true;
    }

    get client(){
        return this.server.clients[0] ||null;
    }
    get clients(){
        return this.server.clients;
    }

    send(){

    }
    sendTo(clientID,payload){
        //find and send
        if(!this.connectedClients.has(clientID)) 
        throw new Error(`There is no client with id:${clientID}`);

        const client = this.connectedClients.get(clientID);
        const buffer = typeof payload !=="string" ? JSON.stringify(payload) : payload;
        client.send(buffer);

    }
    sendToAll(){

    }
    sendToAllExcept(clientID){

    }
    
}