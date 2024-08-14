const express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    path = require('path'),
    session = require('express-session');
const ejs = require('ejs');

const sessionConfig = require('./session');
const userService = require('./services/users.service');
require('express-async-errors')
const db = require('./db'),
    usersRoutes = require('./controllers/users.controller'),
    vehiclesRoutes = require('./controllers/vehicles.controller'),
    reservationRoutes = require('./controllers/reservations.controller'),
    paymentsRoutes = require('./controllers/payments.controller');

app.set('view engine', 'ejs');


app.use(bodyparser.json())
app.use(session(sessionConfig));
app.use('/api/users', usersRoutes);
app.use('/api', vehiclesRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentsRoutes);



app.use(express.static('Frontend'));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      
      console.error('Error destroying session:', err);
    } else {
      
      res.redirect('/login');
    }
  });
});

const isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

app.get('/userhome', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'userHome.html'));
});

app.get('/adminHome',isLoggedIn, isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'AdminHomepage.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'RegisterPage.html'));
});

app.get('/userHeader',isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'UserHeader.html'));
});

app.get('/adminHeader',isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'AdminHeader.html'));
});

app.get('/viewVehicles',isLoggedIn, (req,res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'AdminViewVehicles.html'));
});

app.get('/editVehicle',isLoggedIn, (req, res) => {
    const id = req.query.id;
    db.query(`SELECT * FROM vehicles WHERE id = ?`, [id])
      .then((results) => {
        if (results.length === 0) {
          res.status(404).send({ message: 'Vehicle not found' });
        } else {
          const vehicle = results[0];
          console.log(vehicle);
          res.render('editVehicle', { vehicle });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({ message: 'Error fetching vehicle data' });
      });
  });

app.get('/addVehicles',isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'AdminAddVehicles.html'));
})

app.get('/bookVehicle' ,isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend' , 'BookAVehicle.html'));
})

app.get('/resHist', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'UserResHist.html'));
})

app.get('/edit/users', isLoggedIn, async (req, res) => {
  const userId = req.session.userId;
  const user = await userService.getUserById(userId);
  if (!user) {
    res.status(404).send({ message: 'User not found' });
  } else {
    res.render('editUser', { user });
  }
});

app.get('/AdminResHist', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'AdminResHist.html'));
})
  app.use((err, req, res, next) => {
    console.error(err);
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong: ' + err.message });
  });

app.get('/payHist', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'AdminPayHist.html'));
})

db.query("SELECT 1")
   .then(() => {
        console.log('db Connection Successful')
        app.listen(3000, () => console.log('Server started at 3000.'))
    })
   .catch(err => console.log('db Connection Failed. \n' + err))