const db = require('../db');
const paymentService = require('../services/payments.service');

const mysql = require('mysql2/promise');

module.exports.createReservations = async (reservations) => {
  try {
    console.log('Trying to create reservations:', reservations);

    const results = await Promise.all(reservations.map((reservation) => {
      console.log('Inserting reservation:', reservation);
      const { userId, vehicleId, rentalPeriodStart, rentalPeriodEnd, additionalServices, pricePerDay, payment_method, referenceCode } = reservation; // Generate a unique reference code
      return db.execute(
        `INSERT INTO reservations (user_id, vehicle_id, rental_period_start, rental_period_end, additional_services, pricePerDay, payment_method, reference_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, vehicleId, rentalPeriodStart, rentalPeriodEnd, additionalServices, pricePerDay, payment_method, referenceCode]
      ).then(([result, fields]) => {
        return { insertId: result.insertId };
      });
    }));
    console.log('Reservations created successfully');
    await Promise.all(reservations.map((reservation, index) => {
      const payment = {
        user_id: reservation.userId,
        reservation_id: results[index].insertId,
        vehicle_id: reservation.vehicleId,
        pricePerDay: reservation.pricePerDay,
        payment_method: reservation.payment_method,
        payment_history: 0,
        referenceCode: reservation.referenceCode,
      };
      console.log('Payments Data',payment)
      return paymentService.createPayment(payment);
    }));
    return { success: true };
  } catch (error) {
    console.error('Error creating reservations:', error);
    return { success: false, error: error.message };
  }
};

  const moment = require('moment');

  module.exports.getReservationsByUser = async (userId) => {
    const query = `SELECT r.id, r.user_id, r.vehicle_id,
                          r.rental_period_start,
                          r.rental_period_end,
                          r.additional_services, 
                          r.payment_method,
                          r.reference_code,
                          v.type, 
                          v.make, 
                          v.model, 
                          v.license_plate_number, 
                          v.pricePerDay,
                          u.email
                    FROM reservations r
                    INNER JOIN vehicles v ON r.vehicle_id = v.id
                    INNER JOIN users u ON r.user_id = u.id
                    WHERE r.user_id = ?`;
    try {
      const results = await db.query(query, [userId]);
      //console.log('Results:', results);
      const formattedResults = results[0].map((result) => {
        return {
          ...result,
          rental_period_start: moment(result.rental_period_start).toISOString(),
          rental_period_end: moment(result.rental_period_end).toISOString(),
        };
      });
      return formattedResults.length > 0 ? formattedResults : []; 
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  };

  module.exports.deleteReservation = async (id) => {
    try {

      await paymentService.deletePaymentByReservationId(id);
  

      const query = `DELETE FROM reservations WHERE id = ?`;
      await db.query(query, [id]);
  
      return { success: true, message: 'Reservation deleted successfully' };
    } catch (error) {
      console.error('Error deleting reservation:', error);
      return { success: false, error: error.message };
    }
  };

  module.exports.getReservationById = async (id) => {
    const query = `SELECT * FROM reservations WHERE id = ?`;
    const result = await db.query(query, [id]);
    return result[0][0];
  };
  
  module.exports.updateReservation = async (id, updates) => {
    const query = `UPDATE reservations SET rental_period_start = ?, rental_period_end = ?, additional_services = ?, vehicle_id = ?, pricePerDay = ?, payment_method = ? WHERE id = ?`;
    await db.query(query, [updates.rental_period_start, updates.rental_period_end, updates.additional_services, parseInt(updates.vehicle_id), updates.pricePerDay, parseInt(updates.payment_method), id]);
  
    const paymentUpdate = {
      vehicle_id: updates.vehicle_id,
      pricePerDay: updates.pricePerDay,
      payment_method: updates.payment_method,
    };
    await paymentService.updatePayment(id, paymentUpdate);
  };

  module.exports.getAllReservations = async () => {
    const query = `SELECT r.id, r.user_id, u.email, u.id as user_id, 
                           r.vehicle_id, r.rental_period_start, 
                           r.rental_period_end, r.additional_services, r.payment_method, 
                           v.type, v.make, v.model, v.license_plate_number, 
                           v.pricePerDay
                    FROM reservations r
                    INNER JOIN users u ON r.user_id = u.id
                    INNER JOIN vehicles v ON r.vehicle_id = v.id`;
    try {
      const results = await db.query(query);
      const formattedResults = results[0].map((result) => {
        return {
          ...result,
          rental_period_start: moment(result.rental_period_start).toISOString(),
          rental_period_end: moment(result.rental_period_end).toISOString(),
        };
      });
      return formattedResults.length > 0 ? formattedResults : [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  };