const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const geolib = require('geolib');

// Geocoding - Convert address to coordinates
router.get('/geocode', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'EasyRide/1.0'
                }
            }
        );
        const data = await response.json();

        if (data.length === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            display_name: data[0].display_name
        });
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: 'Geocoding service error' });
    }
});

// Reverse Geocoding - Convert coordinates to address
router.get('/reverse-geocode', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    'User-Agent': 'EasyRide/1.0'
                }
            }
        );
        const data = await response.json();

        res.json({
            address: data.display_name,
            details: data.address
        });
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        res.status(500).json({ error: 'Reverse geocoding service error' });
    }
});

// Get route between two points
router.get('/route', async (req, res) => {
    try {
        const { from_lat, from_lon, to_lat, to_lon } = req.query;
        if (!from_lat || !from_lon || !to_lat || !to_lon) {
            return res.status(400).json({ error: 'Start and end coordinates are required' });
        }

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${from_lon},${from_lat};${to_lon},${to_lat}?overview=full&geometries=geojson`,
            {
                headers: {
                    'User-Agent': 'EasyRide/1.0'
                }
            }
        );
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return res.status(404).json({ error: 'Route not found' });
        }

        const route = data.routes[0];
        res.json({
            distance: route.distance, // in meters
            duration: route.duration, // in seconds
            geometry: route.geometry // GeoJSON format
        });
    } catch (error) {
        console.error('Routing error:', error);
        res.status(500).json({ error: 'Routing service error' });
    }
});

// Find nearby drivers
router.get('/nearby-drivers', async (req, res) => {
    try {
        const { lat, lon, radius = 5000 } = req.query; // radius in meters, default 5km
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Get all active drivers from your database
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const drivers = await prisma.user.findMany({
            where: {
                role: 'driver',
                // Add any other conditions for active drivers
            }
        });

        // Filter drivers within radius
        const nearbyDrivers = drivers.filter(driver => {
            if (!driver.currentLat || !driver.currentLon) return false;
            
            const distance = geolib.getDistance(
                { latitude: lat, longitude: lon },
                { latitude: driver.currentLat, longitude: driver.currentLon }
            );
            
            return distance <= radius;
        });

        res.json({
            count: nearbyDrivers.length,
            drivers: nearbyDrivers.map(driver => ({
                id: driver.id,
                name: driver.name,
                distance: geolib.getDistance(
                    { latitude: lat, longitude: lon },
                    { latitude: driver.currentLat, longitude: driver.currentLon }
                )
            }))
        });
    } catch (error) {
        console.error('Nearby drivers error:', error);
        res.status(500).json({ error: 'Error finding nearby drivers' });
    }
});

module.exports = router;