const db = require('../db');

module.exports.getAllPayments = async () => {
  const query = `SELECT p.id, u.id as user_id, u.email, r.id as reservation_id, 
                         v.id as vehicle_id, v.make, v.model, p.pricePerDay, 
                          p.payment_method, p.payment_history, p.reference_code,
                          DATEDIFF(r.rental_period_end, r.rental_period_start) AS total_days,
                          DATEDIFF(r.rental_period_end, r.rental_period_start) * p.pricePerDay AS total_rent_due
                  FROM payments p
                  INNER JOIN users u ON p.user_id = u.id
                  INNER JOIN reservations r ON p.reservation_id = r.id
                  INNER JOIN vehicles v ON r.vehicle_id = v.id`;
  try {
    const results = await db.query(query);
    return results[0];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

module.exports.createPayment = async (payment) => {
    const query = `INSERT INTO payments (user_id, reservation_id,vehicle_id, pricePerDay, payment_method, payment_history, reference_code) VALUES (?, ?, ?, ?, ?,?, ?)`;
    await db.query(query, [payment.user_id,payment.reservation_id, payment.vehicle_id, payment.pricePerDay, payment.payment_method, payment.payment_history, payment.referenceCode]);
  };


  module.exports.updatePaymentStatus = async (paymentId, paymentStatus) => {
    const query = `UPDATE payments SET payment_history = ? WHERE id = ?`;
    await db.query(query, [paymentStatus, paymentId]);
  };

  module.exports.updatePayment = async (reservationId, paymentUpdate) => {
    const query = `UPDATE payments SET vehicle_id = ?, pricePerDay = ?, payment_method = ? WHERE reservation_id = ?`;
    await db.query(query, [paymentUpdate.vehicle_id, paymentUpdate.pricePerDay, paymentUpdate.payment_method, reservationId]);
  };


  module.exports.deletePaymentByReservationId = async (reservationId) => {
    const query = `DELETE FROM payments WHERE reservation_id = ?`;
    await db.query(query, [reservationId]);
  };