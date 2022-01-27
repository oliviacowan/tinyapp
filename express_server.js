const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = 8080;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const checkEmails = function(inputEmail) {
    for (const userID in users) {
      const user = users[userID];
      if (user.email === inputEmail) {
        return user;
      }
    }
    return null;
}

//main page
app.get('/urls', (req, res) => {
  console.log(req.cookies);
  const user = users[req.cookies.user_id];
  console.log('user: ', user);
  const templateVars = {
    username: user.email,
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
})
//create page
app.get('/urls/new', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    username: user.email,
    urls: urlDatabase
  };
  res.render('urls_new', templateVars);
});
//edit page
app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {username: user.email, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});
//creates a new tinyURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  return res.redirect(`/urls/${shortURL}`);
});
//redirects to longURL from the shortURL link
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
//deletes a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
//edits a url
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});
//creates cookie/logs in
app.post('/login', (req, res) => {
  //pull off email and password from body
  //check if email and password are empty
  //check if a user with that email exists and return user
  //check if password in object and body match
  //make cookie
  //redirect
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  
  if (!newEmail || !newPassword) {
    res.status(400).send('not allowed to provide a blank email or password');
    return;
  }
  const user = checkEmails(newEmail);
  console.log('user:', user);
  if (!user) {
    res.status(400).send('email does not exist');
    return;
  }
  if (user.password !== newPassword) {
    res.status(400).send('incorrect password');
    return;
  }
  res.cookie('user_id', user.id);
  // console.log('email: ', newEmail, 'pass: ', newPassword);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  res.render('urls_login');
})
//logs out
app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
});
//renders the register page
app.get('/register', (req, res) => {
  //const userID = req.cookies['user_id'];
  templateVars = {user: req.cookies['user_id']};
  //const templateVars = {user: users[userID]};
  console.log('wazzup', templateVars);
  res.render('urls_register', templateVars);
});
//creates new user
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', userID);
  res.redirect('/urls');
})

function generateRandomString() {
  const randString = Math.random().toString(24);
  return randString.substring(4, 10);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});