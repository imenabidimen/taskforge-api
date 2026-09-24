import { describe, expect, it } from "vitest";
import { app } from "../src/server";
describe("jobs",()=>{ it("creates a valid job",async()=>{const r=await app.inject({method:"POST",url:"/jobs",payload:{title:"Send weekly report"}});expect(r.statusCode).toBe(201);expect(r.json()).toMatchObject({title:"Send weekly report",status:"queued"});}); it("rejects short title",async()=>{const r=await app.inject({method:"POST",url:"/jobs",payload:{title:"x"}});expect(r.statusCode).toBe(400);});});
