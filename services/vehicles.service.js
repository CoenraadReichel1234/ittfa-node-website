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
  let { vehicleType, make, model, year, pricePerDay, rental_period_start, rental_period_end } = searchParams;
  let query = `SELECT v.* FROM vehicles v LEFT JOIN reservations r ON v.id = r.vehicle_id WHERE `;
  let params = [];
  let orConditions = [];
  if (vehicleType) {
    orConditions.push(`v.type = ?`);
    params.push(vehicleType);
  }
  if (make) {
    orConditions.push(`v.make = ?`);
    params.push(make);
  }
  if (model) {
    orConditions.push(`v.model = ?`);
    params.push(model);
  }
  if (year) {
    orConditions.push(`v.year = ?`);
    params.push(year);
  }
  if (pricePerDay) {
    orConditions.push(`v.pricePerDay = ?`);
    params.push(pricePerDay);
  }

  if (orConditions.length > 0) {
    query += `(${orConditions.join(' OR ')}) AND `;
  }

  query += `(r.vehicle_id IS NULL OR r.rental_period_end < ? OR r.rental_period_start > ?) `;
  params.push(rental_period_start);
  params.push(rental_period_end);
  query = query.replace(/OR\s*$/, '');
  const [records] = await db.query(query, params);
  return records;
};


module.exports.getVehicleById = async (id) => {
  const query = `SELECT * FROM vehicles WHERE id = ?`;
  const result = await db.query(query, [id]);
  return result[0];
};
