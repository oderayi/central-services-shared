/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 * Name Surname <name.surname@gatesfoundation.com>

 * Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/
'use strict'

const fs = require('fs')
const path = require('path')
const YAML = require('yaml')
const shins = require('shins')
const widdershins = require('widdershins')

const widdershinsOptions = {
  codeSamples: true,
  httpsnippet: false,
  theme: 'darkula',
  search: true,
  sample: true,
  discovery: false,
  shallowSchemas: false,
  tocSummary: false,
  headings: 2,
  yaml: false
}

const shinsOptions = {
  cli: false,
  minify: true,
  customCss: false,
  inline: true,
  unsafe: false
  // ['no-links']: false,
  // logo: './my-custom-logo.png',
  // ['logo-url']: 'https://www.example.com'
}

/**
 * Generate API documentation from OpenAPI specification document (.yaml or .json)
 *
 * @param {object} options  - options.documentPath - Full path to the OpenAPI (fka Swagger) document (JSON or YAML). Mutually exclusive to `document` option.
 *                            options.document - OpenAPI document as string. Mutually exclusive to `documentPath` option.
 * @returns {string}        - API documentation in HTML format
 */
const generateDocumentation = async (options) => {
  return _build(_getOpenAPISpec(options))
}

/**
 * Return API spec as JS object
 *
 * @param {object} options  - options.documentPath - Full path to the OpenAPI (fka Swagger) document (JSON or YAML). Mutually exclusive to `document` option.
 *                            options.document - OpenAPI document as string. Mutually exclusive to `documentPath` option.
 * @returns {object}        - API spec object
 */
const _getOpenAPISpec = (options) => {
  let docObj

  if (options.documentPath) {
    if (!fs.existsSync(options.documentPath)) throw new Error('API specification document was not be found.')

    const ext = path.extname(options.documentPath)

    if (!['.yaml', '.json'].includes(ext.toLowerCase())) throw new Error('API documentation document has unsupported file extension.')

    docObj = (ext === '.yaml')
      ? YAML.parse(fs.readFileSync(options.documentPath, 'utf8'))
      : JSON.parse(fs.readFileSync(options.documentPath))
  } else {
    docObj = options.document
  }

  return docObj
}

/**
 * Build API spec documentation from JS object
 * generated from API spec document.
 *
 * @param {object} apiSpecObj
 *
 * @returns {string} API documentation in HTML format
 */
const _build = async (apiSpecObj) => {
  const md = await widdershins.convert(apiSpecObj, widdershinsOptions)
  const htmlPromise = new Promise((resolve, reject) => {
    shins.render(md, shinsOptions, (err, html) => {
      if (err !== null) reject(err)
      else resolve(html)
    })
  })

  return htmlPromise
}

/**
 * Return OpenAPI specification document as JSON.
 *
 * @param {object} options  - options.documentPath - Full path to the OpenAPI (fka Swagger) document (JSON or YAML). Mutually exclusive to `document` option.
 *                            options.document     - OpenAPI document as string. Mutually exclusive to `documentPath` option.
 * @returns {string}        - API spec in JSON format
 */
const swaggerJSON = (options) => {
  return JSON.stringify(_getOpenAPISpec(options))
}

module.exports = {
  generateDocumentation,
  swaggerJSON
}
