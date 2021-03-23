const UID = require("../../src/Utils/UID")

describe("UID - serial key generator",()=>{
    it("default value should be 0",()=>{
        const uid = new UID();
        expect(uid).toHaveProperty("id",0)
    })
    it("should increment when calling next",()=>{
        const uid = new UID();
        expect(uid.next()).toBe(1);
        expect(uid.next()).toBe(2);
    })
    it("should reset to 1 when >= max value",()=>{
        const uid = new UID();
        const max = UID.max;
        //override id for testing
        uid.id = max -2;
        expect(uid.next()).toBe(max-1);
        expect(uid.next()).toBe(max);
        expect(uid.next()).toBe(1);
        expect(uid.next()).toBe(2);
    })
})