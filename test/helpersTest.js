const { assert } = require('chai');
const { checkEmails } = require('../helpers.js');


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkEmails', function() {
  it('should return a user with valid email', function() {
    const user = checkEmails("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal((user), expectedUserID)
  });
  it('should return undefined if the email is not in the users database', function() {
    const user = checkEmails("hey@gmail.com", testUsers);
    const expected = undefined;
    assert.equal(user, expected);
  })
});

