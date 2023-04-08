import * as http from 'http'
import * as path from "path"
import * as fs from "fs"
import * as url from "url"
import { Panel } from './panel';
import { Auth } from './auth';

console.log(process.argv);
let argPort: number = null;
process.argv.forEach(it=>{
    const kv = it.split('=');
    console.log(kv[0], kv[1]);
    if (kv[0] == 'port'){
        const p = Number.parseInt(kv[1]);
        if (!Number.isNaN(p) && p >=3000 && p<=5000){
            argPort = p;
            console.log('Port from argv: ', argPort);
        } else {
            console.log('Port should be between 3000 and 5000');
        }
    }
})

const port = process.env.PORT || argPort || 4004
const panel = new Panel();
const cors = {
  'Content-Type': 'text/plain',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
}

const server = http.createServer(async (req, res) => {
  const result = await panel.handleRequest(req);
  if (result){
    res.writeHead(200, cors);
    res.end(result);
  } else {
    res.writeHead(404, cors);
    res.end("not found");
  }
})

server.listen(port, () => {
  console.log(new Date() + ` Server is listening on port ${port}`)
})