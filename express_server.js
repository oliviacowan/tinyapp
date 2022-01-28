const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//data


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
}
//helper function
const checkEmails = function (inputEmail) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === inputEmail) {
      return user;
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
//data
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

//main page
app.get('/urls', (req, res) => {
  if (req.cookies.user_id) {
    const userId = req.cookies.user_id;
    const user = users[userId];
    const urls = urlsForUser(userId, urlDatabase);
  
      const templateVars = {
        user,
        urls,
      }
      res.render('urls_index', templateVars);
      return;
  }
  const templateVars = {
    user: undefined,
  };
  res.render('urls_indexNotLoggedIn', templateVars)
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
  if (!user) {
    res.send('User not logged in');
    return;
  }
  const urlWithId = urlDatabase[req.params.shortURL];
  if (user.id !== urlWithId.userID) {
    res.send('This url does not belong to you');
    return;
  }

  const templateVars = { user: user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  console.log(templateVars);
  res.render('urls_show', templateVars);
});
//creates a new tinyURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  return;
});
//redirects to longURL from the shortURL link
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  console.log('short: ', shortURL, 'long: ', longURL);
  res.redirect(longURL);
});
//deletes a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.send('this is not yours to delete');
    return
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
//edits a url
app.post('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.send('this is not yours to edit');
    return
  }
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID,
  }
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
  //const hashedPassword = bcrypt.hashSync(newPassword, 10);

  if (!newEmail || !newPassword) {
    res.status(400).send('not allowed to provide a blank email or password');
    return;
  }
  const user = checkEmails(newEmail);
  if (!user) {
    res.status(400).send('email does not exist');
    return;
  }
  
  if (!bcrypt.compareSync(newPassword, user.password)) {
    res.status(400).send('email does not exist');
    return;
  }
  // if (user.password !== newPassword) {
  //   res.status(400).send('incorrect password');
  //   return;
  // }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});
//login
app.get('/login', (req, res) => {
  templateVars = { user: req.cookies['user_id'] };
  res.render('urls_login', templateVars);
})
//logs out
app.post('/logout', (req, res) => {
  const user = req.cookies.user_id;
  //console.log('wazzup', user)
  res.clearCookie('user_id', user);
  res.redirect('/urls');
});
//renders the register page
app.get('/register', (req, res) => {
  templateVars = { user: req.cookies['user_id'] };
  //console.log('wazzup', templateVars);
  res.render('urls_register', templateVars);
});
//creates new user
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  loginEmail = req.body.email;
  loginPass = req.body.password;
  hashedPassword = bcrypt.hashSync(loginPass, 10);

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
    email: loginEmail,
    password: hashedPassword
  };
  console.log(users);
  res.cookie('user_id', userID);
  res.redirect('/urls');
})

//helper function
function generateRandomString() {
  const randString = Math.random().toString(24);
  return randString.substring(4, 10);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});