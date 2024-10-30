require('dotenv').config({ path: './sample.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.DB);
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

const { Schema } = mongoose;

const defaultTimestamp = () => new Date();

const ReplySchema = new Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: defaultTimestamp },
  bumped_on: { type: Date, default: defaultTimestamp },
  reported: { type: Boolean, default: false },
});


const ThreadSchema = new Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: defaultTimestamp },
  bumped_on: { type: Date, default: defaultTimestamp },
  reported: { type: Boolean, default: false },
  replies: [ReplySchema],
});


const BoardSchema = new Schema({
  title: { type: String, required: true },
  threads: [ThreadSchema],
});

const Board = mongoose.model('Board', BoardSchema);

module.exports = { connectDB, Board };
