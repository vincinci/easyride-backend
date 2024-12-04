const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

const authRoutes = require('../routes/auth');
const rideRoutes = require('../routes/rides');
const locationRoutes = require('../routes/location');
const vehicleRoutes = require('../routes/vehicles');

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/vehicles', vehicleRoutes);

module.exports = app;
