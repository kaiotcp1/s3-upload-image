import express from 'express';
import { DatabaseConnection } from './database/database-connection';
import { ObjectId } from 'mongodb';

export const app = express();
app.use(express.json());

const DB_NAME = process.env.MONGO_DB_NAME || '';
const COLLECTION_NAME = process.env.MONGO_DB_COLLECTION_NAME || '';

app.post('/', async (req, res) => {
  try {
    const collection = await DatabaseConnection.getCollection(DB_NAME, COLLECTION_NAME);
    const users = await collection.insertOne({
      _id: new ObjectId('223456789012345678901234'),
      age: 29,
      email: ''
    } as any)

    res.status(201).json(users);
  } catch (error) {
    console.log(error)
  }
});

