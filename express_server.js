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
    user: user,
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
})
//create new tinyURL page
app.get('/urls/new', (req, res) => {
  const userID = req.cookies.user_id
  if (!userID) {
    res.redirect('/login')
    return;
  } else {
  const templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render('urls_new', templateVars);
}
});
//edit page
app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {user: user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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
  res.redirect('/urls');
});
//login
app.get('/login', (req, res) => {
  templateVars = {user: req.cookies['user_id']};
  res.render('urls_login', templateVars);
})
//logs out
app.post('/logout', (req, res) => {
  const user = users[req.cookies.user_id];
  console.log(user, 'hereee')
  res.clearCookie('user_id', user.id);
  res.redirect('/urls');
});
//renders the register page
app.get('/register', (req, res) => {
  templateVars = {user: req.cookies['user_id']};
  console.log('wazzup', templateVars);
  res.render('urls_register', templateVars);
});
//creates new user
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  loginEmail = req.body.email;
  loginPass = req.body.password;

  if (!loginEmail || !loginPass) {
    res.status(400).send('invalid email or password');
    return;
  }
  const email = checkEmails(loginEmail); 
  if (email) {
    res.status(400).send('email already exists, please login.');
    return;
  }
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