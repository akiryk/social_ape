const chai = require('chai');
const sinon = require('sinon');
const { getAllScreams } = require('../handlers/screams.js');
const { db } = require('../util/admin');
const { mockScreams } = require('./mocks');

const { expect } = chai;

describe('Screams', function() {
  it('getAllScreams should return all screams', function() {
    const req = {};
    // Have `res` have a send key with a function value coz we use `res.send()` in our func
    const res = {
      json: sinon.spy(),
    };

    const dbStub = sinon.stub(db, 'collection').returns(mockScreams);
    getAllScreams(req, res);
    return expect(dbStub.calledOnce).to.be.true;
  });
});
