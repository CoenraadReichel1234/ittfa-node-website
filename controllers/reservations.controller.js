const express = require('express');
const router = express.Router();
const service = require('../services/reservations.service');
const vehicleService = require('../services/vehicles.service');
const paymentService = require('../services/payments.service');

router.post('/createReservation', async (req, res) => {
  console.log(req.body);
  const { userId, vehicleId, rentalPeriodStart, rentalPeriodEnd, additionalServices, pricePerDay, payment_method} = req.body;
  const referenceCode = generateReferenceCode();
  const reservation = {
    userId,
    vehicleId,
    rentalPeriodStart,
    rentalPeriodEnd,
    additionalServices,
    pricePerDay,
    payment_method,
    referenceCode,
  };
  try {
    console.log('Calling createReservations service:', reservation);
    await service.createReservations([reservation]);
    console.log('Reservations created successfully');
    res.json({ success: true, message: `Reservation created successfully. Your reference code is ${referenceCode}.`, referenceCode });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

  function generateReferenceCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referenceCode = '';
    for (let i = 0; i < 10; i++) {
      referenceCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return referenceCode;
  }
  
  router.get('/viewHist', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.session.userId;
    try {
      const reservations = await service.getReservationsByUser(userId);
      //console.log('Reservations:', reservations, ':', userId);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/viewAdminHist', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const reservations = await service.getAllReservations();
      //console.log('Reservations:', reservations);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
      await service.deleteReservation(id);
      res.json({ success: true, message: 'Reservation deleted successfully' });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const reservation = await service.getReservationById(id);
      const userId = req.session.userId;
      const pricePerDay = reservation.pricePerDay;
      const reference_code = reservation.reference_code;
      const vehicles = await vehicleService.getAllVehicles();
      res.render('editReservation', { reservation, vehicles: await vehicleService.getAllVehicles(), userId, pricePerDay });
    } catch (error) {
      console.error('Error fetching reservation:', error);
      res.status(500).send({ message: 'Error fetching reservation data' });
    }
  });
  
  router.put('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { rental_period_start, rental_period_end, additional_services, vehicle_id, pricePerDay,payment_method, reference_code } = req.body;
    
    console.log(req.body);
    
    if (!vehicle_id || isNaN(parseInt(vehicle_id))) {
      console.error(`Invalid vehicle_id: ${vehicle_id}`);
      return res.status(400).send({ message: 'Invalid vehicle_id' });
    }
    if (![0, 1].includes(parseInt(payment_method))) {
      console.error(`Invalid payment_method: ${payment_method}`);
      return res.status(400).send({ message: 'Invalid payment_method' });
    }
  
    try {
      await service.updateReservation(id, {
        rental_period_start,
        rental_period_end,
        additional_services,
        vehicle_id: parseInt(vehicle_id),
        pricePerDay,
        payment_method: parseInt(payment_method),
        reference_code,
      });

      const paymentUpdate = {
        vehicle_id,
        pricePerDay,
        payment_method: parseInt(payment_method),
      };
      await paymentService.updatePayment(id, paymentUpdate);
  
      console.log(`Reservation updated successfully: ${id}`);
      res.json({ success: true, message: 'Reservation updated successfully' });
    } catch (error) {
      console.error(`Error updating reservation: ${error}`);
      res.status(500).send({ message: 'Error updating reservation data' });
    }
  });
  
  module.exports = router;