const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromsied = require('chai-as-promised')

chai.use(sinonChai)
chai.use(chaiAsPromsied)

module.exports = chai.expect
