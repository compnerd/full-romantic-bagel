// Copyright © 2022 Saleem Abdulrasool <compnerd@compnerd.org>
// SPDX-License-Identifier: BSD-3-Clause

const dotenv = require('dotenv')
const fs = require('fs')
const gitclone = require('gitclone')
const path = require('path')
const { XmlRpcServer, XmlRpcFault } = require('@foxglove/xmlrpc')
const { HttpServerNodejs } = require('@foxglove/xmlrpc/nodejs')

dotenv.config()

const repository = path.join(__dirname, 'repos', 'manifest')
const manifest = path.join(__dirname, 'repos', 'manifest', process.env.MANIFEST)

gitclone(process.env.REPO, {dest: repository})

const server = new XmlRpcServer(new HttpServerNodejs())
server.setHandler('GetApprovedManifest', function (method, args) {
  gitclone(process.env.REPO, {dest: repository})

  try {
    const data = fs.readFileSync(manifest)
    return [1, data.toString()]
  } catch (error) {
    throw new XmlRpcFault(error)
  }
})

async function main () {
  await server.listen(3000).then(function () {
    const url = server.server.url() ?? 'http://localhost'
    console.info(`full-romantic-bagel listening at ${url}`)
  })
}
main()
