
const checkEmails = function (inputEmail, users) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === inputEmail) {
      return user.id;
    }
  }
  return null;
}

const urlsForUser = function(id, urlDatabase) {
  const urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
} 


function generateRandomString() {
  const randString = Math.random().toString(24);
  return randString.substring(4, 10);
}

module.exports = { checkEmails, urlsForUser, generateRandomString };