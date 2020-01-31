'use strict'

const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chai = require('chai')

chai.use(sinonChai)

global.expect = chai.expect

beforeEach(function () {
  this.sandbox = sinon.createSandbox()
})
