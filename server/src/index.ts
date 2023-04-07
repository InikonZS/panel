import * as http from 'http'
import * as path from "path"
import * as fs from "fs"
import * as url from "url"
import { Panel } from './panel';

const port = process.env.PORT || 4004
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