const { json } = require('body-parser');
const db = require('../db');

module.exports.getAllUsers = async () => {
    const [records] = await db.query("SELECT * FROM users");
    return records;
};

module.exports.getUserById = async (id) => {
    const [[record]] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return record;
};

module.exports.deleteUser = async (id) => {
    const [{ affectedRows }] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return affectedRows;
};

module.exports.updateUser = async (id, obj) => {
    let isAdmin = 0;
    if (obj.isAdmin !== undefined) {
      if (typeof obj.isAdmin === 'string') {
        isAdmin = obj.isAdmin.toLowerCase() === 'true' ? 1 : 0;
      } else if (typeof obj.isAdmin === 'boolean') {
        isAdmin = obj.isAdmin ? 1 : 0;
      } else if (typeof obj.isAdmin === 'number' && (obj.isAdmin === 0 || obj.isAdmin === 1)) {
        isAdmin = obj.isAdmin;
      } else {
        console.log("isAdmin: ", isAdmin);
        throw new Error('Invalid isAdmin value. It must be a boolean or an integer value (0 or 1).');
      }
    }
  
    let password = obj.confirm_password;
    if (!password) {
      const user = await module.exports.getUserById(id);
      password = user.password;
    }
  
    const [{ affectedRows }] = await db.query("CALL usp_user_add_or_edit(?,?,?,?,?,?,?)", [
      id,
      isAdmin,
      obj.first_name,
      obj.last_name,
      obj.email,
      obj.phone_number,
      password
    ]);
    return affectedRows;
  };

module.exports.addOrEditUser = async (obj, id = 0) => {
    try {
        const [[[{ affectedRows }]]] = await db.query("CALL usp_user_add_or_edit(?,?,?,?,?,?,?)", [
            id,
            obj.isAdmin,
            obj.first_name,
            obj.last_name,
            obj.email,
            obj.phone_number,
            obj.password,
        ]);
        return JSON.stringify({ success: true, message: 'User created successfully' });
    } catch (error) {
        return JSON.stringify({ success: false, message: 'Error creating user: ' + error.message });
    }
};

module.exports.getUserByEmail = async (email) => {
    const [[record]] = await db.query("SELECT * FROM users WHERE email =?", [email]);
    return record;
};

module.exports.getUserByEmailAndPassword = async (email, password) => {
    const [[record]] = await db.query("SELECT * FROM users WHERE email =? AND password =?", [email, password]);
    return record;
};