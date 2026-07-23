const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 🍃 MongoDB Atlas Cloud Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not defined in .env file!');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Cloud Database Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// 📦 Mongoose Schema for Number Stock
const StockSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  country: { type: String, required: true, default: 'United States' },
  createdAt: { type: Date, default: Date.now }
});

const Stock = mongoose.model('Stock', StockSchema);

// --- API ROUTES --- //

// Get Stock
app.get('/api/stock', async (req, res) => {
  try {
    const stockList = await Stock.find().sort({ createdAt: -1 });
    res.json({ success: true, count: stockList.length, stock: stockList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Add Number
app.post('/api/stock/add', async (req, res) => {
  try {
    const { number, country } = req.body;
    if (!number) return res.status(400).json({ success: false, message: 'Number is required' });

    const newNumber = new Stock({ number, country: country || 'United States' });
    await newNumber.save();
    res.status(201).json({ success: true, message: 'Number added successfully!', data: newNumber });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Number already exists' });
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Delete Number
app.delete('/api/stock/delete/:id', async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Number not found' });
    res.json({ success: true, message: 'Number deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
