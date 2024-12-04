const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new ride
router.post('/', async (req, res) => {
  const { riderId, pickupLocation, dropoffLocation } = req.body;
  const ride = await prisma.ride.create({
    data: { riderId, pickupLocation, dropoffLocation, status: 'requested' }
  });
  res.json(ride);
});

// Get all rides for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const rides = await prisma.ride.findMany({
    where: { OR: [{ riderId: Number(userId) }, { driverId: Number(userId) }] }
  });
  res.json(rides);
});

// Update ride status
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, driverId } = req.body;
  const ride = await prisma.ride.update({
    where: { id: Number(id) },
    data: { status, driverId }
  });
  res.json(ride);
});

module.exports = router;