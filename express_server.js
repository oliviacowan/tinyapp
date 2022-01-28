const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { checkEmails } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { generateRandomString } = require('./helpers');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//data//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

//GET /urls
app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const user = users[userId];
    const urls = urlsForUser(userId, urlDatabase);
    
    const templateVars = {
      user,
      urls,
    };
    res.render('urls_index', templateVars);
    return;
  }
  const templateVars = {
    user: null,
    urls: null
  };
  res.render('urls_indexNotLoggedIn', templateVars);
});
//POST /urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
  return;
});

//CREATE NEW
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  } else {
    const templateVars = {
      user: users[userID],
      urls: urlDatabase
    };
    res.render('urls_new', templateVars);
  }

});
//GET urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.send('User not logged in');
    return;
  }
  const urlWithId = urlDatabase[req.params.shortURL];
  if (user.id !== urlWithId.userID) {
    res.send('This url does not belong to you');
    return;
  }
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show', templateVars);
  return;
});
//POST urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.send('this is not yours to edit');
    return;
  }
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID,
  };
  res.redirect('/urls');
  return;
});
//REDIRECTS FROM SHORT URL TO LONG URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
  return;
});
//DELETES URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.send('this is not yours to delete');
    return;
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
  return;
});
//LOGS IN
app.post('/login', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (!newEmail || !newPassword) {
    res.status(400).send('not allowed to provide a blank email or password');
    return;
  }
  const ID = checkEmails(newEmail, users);
  const user = users[ID];
  
  if (!user) {
    res.status(400).send('email does not exist');
    return;
  }
  
  if (!bcrypt.compareSync(newPassword, user.password)) {
    res.status(400).send('email does not exist');
    return;
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
  return;
});

//LOGIN
app.get('/login', (req, res) => {
  const templateVars = { user: req.session.user_id};
  res.render('urls_login', templateVars);
  return;
});
//LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
  return;
});

//GET /REGISTER
app.get('/register', (req, res) => {
  const templateVars = { user: req.session.user_id };
  res.render('urls_register', templateVars);
  return;
});

//POST /REGISTER
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  if (!newEmail || !newPassword) {
    res.status(400).send('invalid email or password');
    return;
  }
  const email = checkEmails(newEmail, users);
  if (email) {
    res.status(400).send('email already exists, please login.');
    return;
  }
  users[userID] = {
    id: userID,
    email: newEmail,
    password: hashedPassword
  };

  req.session.user_id = userID;
  res.redirect('/urls');
  return;
});

//SERVER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});