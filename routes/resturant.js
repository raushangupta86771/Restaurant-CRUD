const express = require('express');
const router = express.Router();
const Restaurant = require('../models/resturant');

// Create a new restaurant
router.post('/restaurant', async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);
        res.status(201).json(restaurant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all restaurants
router.get('/restaurant', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get restaurant by ID
router.get('/restaurant/:id', getRestaurant, (req, res) => {
    res.json(res.restaurant);
});

// Update restaurant by ID
router.patch('/restaurant/:id', getRestaurant, async (req, res) => {
    if (req.body.name != null) {
        res.restaurant.name = req.body.name;
    }
    if (req.body.description != null) {
        res.restaurant.description = req.body.description;
    }
    if (req.body.location != null) {
        res.restaurant.location = req.body.location;
    }
    if (req.body.ratings != null) {
        res.restaurant.ratings = req.body.ratings;
    }
    try {
        const updatedRestaurant = await res.restaurant.save();
        res.json(updatedRestaurant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete restaurant by ID
router.delete('/restaurant/:id', getRestaurant, async (req, res) => {
    try {
        await res.restaurant.remove();
        res.json({ message: 'Deleted restaurant' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware function to get restaurant by ID
async function getRestaurant(req, res, next) {
    let restaurant;
    try {
        restaurant = await Restaurant.findById(req.params.id);
        if (restaurant == null) {
            return res.status(404).json({ message: 'Cannot find restaurant' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.restaurant = restaurant;
    next();
}

// Get restaurants within specified radius of latitude and longitude
router.get('/nearby', async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    try {
        const restaurants = await Restaurant.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radius
                }
            }
        });
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
