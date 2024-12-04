const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a new vehicle
router.post('/', async (req, res) => {
  const { userId, make, model, year, licensePlate, color } = req.body;

  try {
    const vehicle = await prisma.vehicle.create({
      data: { userId, make, model, year, licensePlate, color }
    });
    res.status(201).json(vehicle); // Respond with 201 Created
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'An error occurred while creating the vehicle.' });
  }
});

// Get all vehicles for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: Number(userId) }
    });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'An error occurred while fetching vehicles.' });
  }
});

// Delete a vehicle
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.vehicle.delete({ where: { id: Number(id) } });
    res.status(204).send(); // Respond with 204 No Content
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      res.status(404).json({ error: 'Vehicle not found.' });
    } else {
      res.status(500).json({ error: 'An error occurred while deleting the vehicle.' });
    }
  }
});

module.exports = router;