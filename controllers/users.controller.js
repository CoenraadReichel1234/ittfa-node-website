const express = require('express'),
    router = express.Router();

const service = require('../services/users.service');

// Existing routes
router.get('/', async (req, res) => {
    const users = await service.getAllUsers();
    res.send(users);
});

router.get('/edit/:id', async (req, res) => {
    const user = await service.getUserById(req.params.id);
    if (user == undefined)
        res.status(404).json('No User');
    else
        res.send(user);
});

router.put('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, email, phone_number, confirm_password } = req.body;
  const affectedRows = await service.updateUser(id, { first_name, last_name, email, phone_number, confirm_password });
  if (affectedRows == 0)
      res.status(404).json('No User');
  else
      res.send(`User with id ${id} updated`);
});

router.delete('/:id', async (req, res) => {
    const affectedRows = await service.deleteUser(req.params.id);
    if (affectedRows == 0)
        res.status(404).json('No User');
    else
        res.send(`User with id ${req.params.id} deleted`);
});

router.post('/register', async (req, res) => {
    const { isAdmin, email, first_name, last_name, phone_number, password } = req.body;
    const user = await service.addOrEditUser({ isAdmin, email, first_name, last_name, phone_number, password });
    res.json({ success: true, message: 'User created successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  //console.log(`Received login request with email ${email} and password ${password}`);
  const user = await service.getUserByEmailAndPassword(email, password);
  if (user) {
    //console.log(`User found: ${user.id}`);
    req.session.userId = user.id;
    //console.log(`Session set: ${req.session.userId}`);
    if (user.isAdmin == 1) {
      res.json({ redirect: '/adminHome', userId: user.id });
    } else {
      res.json({ redirect: '/userhome', userId: user.id });
    }
  } else {
    console.log(`User not found`);
    res.status(401).json('Invalid email or password');
  }
});

module.exports = router;