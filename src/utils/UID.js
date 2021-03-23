module.exports = class UID {
  static max=10^5;
    constructor() {
      this.id=0;
    }
    next() {
      if(this.id++ >= UID.max) this.id = 1;
      return this.id;
    }
    
}
  




