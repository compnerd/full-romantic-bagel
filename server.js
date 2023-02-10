// Copyright © 2022 Saleem Abdulrasool <compnerd@compnerd.org>
// SPDX-License-Identifier: BSD-3-Clause

const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const SimpleGit = require('simple-git')
const { XmlRpcServer, XmlRpcFault } = require('@foxglove/xmlrpc')
const { HttpServerNodejs } = require('@foxglove/xmlrpc/nodejs')

dotenv.config()

const repository = path.join(__dirname, 'repos', 'manifest')
const manifest = path.join(__dirname, 'repos', 'manifest', process.env.MANIFEST)

const server = new XmlRpcServer(new HttpServerNodejs())
server.setHandler('GetApprovedManifest', async function (method, args) {
  const git = SimpleGit(repository)
  await git
    .fetch('github', 'main')
    .then(async () => git.checkout('github/main'))
    .catch((error) => console.error(`update failure: ${error}`))

  try {
    const data = fs.readFileSync(manifest)
    return [1, data.toString()]
  } catch (error) {
    throw new XmlRpcFault(error)
  }
})

async function main() {
  await server.listen(3000).then(async function () {
    if (!fs.existsSync(repository)) {
      fs.mkdirSync(repository)
      try {
        const git = SimpleGit(repository)
        await git.init().then(async function () {
          dotenv.config()
          const url =
              (process.env.GITHUB_USER && process.env.GITHUB_TOKEN)
                  ? `https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@github.com/${process.env.REPO}`
                  : `https://github.com/${process.env.REPO}`
          git.addRemote('github', url)
        })
      } catch (error) {
        console.error(`initialisation failure: ${error}`)
        throw error
      }
    }

    const url = server.server.url()
    console.info(`full-romantic-bagel listening at ${url}`)
  })
}
main()
