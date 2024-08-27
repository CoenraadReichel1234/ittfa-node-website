const express = require('express');
const router = express.Router();
const service = require('../services/vehicles.service');


router.get('/viewVehicles', async (req, res) => {
    const vehicles = await service.getAllVehicles();
    res.json(vehicles);
});

router.post('/addVehicle', async (req, res) => {
    const { type, make, model, year, license_plate_number, vin, pricePerDay } = req.body;
    const vehicle = await service.createVehicle({type, make, model, year, license_plate_number, vin, pricePerDay});
    res.json({ success: true, message: 'Vehicle added successfully' });
    
});

router.put('/vehicles/:id', async (req, res) => {
    const id = req.params.id;
    const vehicle = req.body;
    const updated = await service.updateVehicle(id, vehicle);
    res.send(updated);
});

router.delete('/vehicles/:id', async (req, res) => {
    const affectedRows = await service.deleteVehicle(req.params.id);
    if (affectedRows == 0)
        res.status(404).json('No Vehicles found');
    else
        res.send(`Vehicle with id ${req.params.id} deleted`);
});

router.post('/searchVehicles', async (req, res) => {
  const { vehicleType, make, model, year, pricePerDay, rental_period_start, rental_period_end } = req.body;
  const vehicles = await service.searchVehicles({ vehicleType, make, model, year, pricePerDay, rental_period_start, rental_period_end });
  if (vehicles.length === 0) {
    res.status(404).json({ message: 'No vehicles found' });
  } else {
    res.json(vehicles);
  }
});
  

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const vehicle = await vehicleService.getVehicleById(id);
    res.json(vehicle);
  } catch (error) {
    console.error(`Error fetching vehicle: ${error}`);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
