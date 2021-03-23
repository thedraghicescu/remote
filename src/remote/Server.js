const http = require('http');
const url = require('url');

const config = {
	port: 59990
};

module.exports = class Server {
    constructor(clientsServices,options){

		// map services to pending webscoket servers
		this.services =clientsServices;

		//ovveride setup from defaulst with user options
		this.setup = {...config,...options}

		
    }
	start(){
		this.httpServer = http.createServer();
		this.httpServer.on("upgrade",(request, socket, head)=>this.handleServerUpgrade(request, socket, head))
		this.httpServer.listen(this.setup.port);
	}

    
	handleServerUpgrade(request, socket, head){
		const path = url.parse(request.url).pathname;
		const service =this.services.find(service=>service.path === path);
		if(!service){
			socket.send("This service is not registered")
			socket.destroy();
		}
		
		service.server.handleUpgrade(request, socket, head, (ws)=>{
			service.server.emit('connection', ws, request);
		});

	}
}