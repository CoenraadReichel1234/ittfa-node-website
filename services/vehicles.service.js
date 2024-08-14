const db = require('../db');

module.exports.getAllVehicles = async () => {
  const [records] = await db.query("SELECT * FROM vehicles");
  return records;
};

module.exports.createVehicle = async (vehicle) => {
  const { type, make, model, year, license_plate_number, vin, pricePerDay } = vehicle;
  const [{ insertId }] = await db.query(
    "INSERT INTO vehicles (type, make, model, year, license_plate_number, vin, pricePerDay) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [type, make, model, year, license_plate_number, vin, pricePerDay]
  );
  return { id: insertId, ...vehicle };
};



module.exports.updateVehicle = async (id, vehicle) => {
  const { type, make, model, year, license_plate_number, vin, pricePerDay } = vehicle;
  const [{ affectedRows }] = await db.query(
    "UPDATE vehicles SET type = ?, make = ?, model = ?, year = ?, license_plate_number = ?, vin = ?, pricePerDay = ? WHERE id = ?",
    [type, make, model, year, license_plate_number, vin, pricePerDay, id]
  );
  return affectedRows > 0;
};

module.exports.deleteVehicle = async (id) => {
  const [{ affectedRows }] = await db.query("DELETE FROM vehicles WHERE id = ?", [id]);
  return affectedRows > 0;
};



module.exports.searchVehicles = async (searchParams) => {
  let { vehicleType, make, model, year, pricePerDay } = searchParams;
  let query = `SELECT * FROM vehicles WHERE `;
  let params = [];
  if (vehicleType) {
    query += `type = ? OR `;
    params.push(vehicleType);
  }
  if (make) {
    query += `make = ? OR `;
    params.push(make);
  }
  if (model) {
    query += `model = ? OR `;
    params.push(model);
  }
  if (year) {
    query += `year = ? OR `;
    params.push(year);
  }
  if (pricePerDay) {
    query += `pricePerDay = ? OR `;
    params.push(pricePerDay);
  }
  query = query.replace(/OR\s*$/, '');
  const [records] = await db.query(query, params);
  return records;
};


module.exports.getVehicleById = async (id) => {
  const query = `SELECT * FROM vehicles WHERE id = ?`;
  const result = await db.query(query, [id]);
  return result[0];
};