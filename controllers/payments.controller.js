const express = require('express');
const router = express.Router();
const service = require('../services/payments.service');

router.get('/viewAdminPayHist', async (req, res) => {
  try {
    const payments = await service.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.post('/updatePaymentStatus', async (req, res) => {
  const { paymentId, paymentStatus } = req.body;
  try {
    await service.updatePaymentStatus(paymentId, paymentStatus);
    res.json({ success: true, message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;