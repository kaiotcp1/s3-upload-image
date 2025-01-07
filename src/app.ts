import express, { Request, Response } from 'express';
import { DatabaseConnection } from './database/database-connection';
import { ObjectId } from 'mongodb';
import multer from 'multer';
import { stringify } from 'querystring';
import { S3 } from 'aws-sdk';
import crypto from 'node:crypto'
import sharp from 'sharp'


const DB_NAME = process.env.MONGO_DB_NAME || '';
const COLLECTION_NAME = process.env.MONGO_DB_COLLECTION_NAME || '';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
const BUCKET_REGION = process.env.AWS_BUCKET_REGION || '';
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const s3 = new S3({
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_KEY,
  },
  region: process.env.AWS_REGION || ''
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const app = express();
app.use(express.json());


app.post('/v1/image/post', upload.single('image'), async (req: Request, res: Response) => {
  try {

    // console.log('REQUEST BODY: ', stringify(req.body));
    // console.log('REQUEST FILE:', req.file);
    if (!req.file) {
      return res.status(400).json({ message: 'No image file found in the request' });
    };

    const buffer = await sharp(req.file?.buffer)
      .resize({ height: 1920, width: 1080, fit: 'contain' })
      .toBuffer()

    const imageName = randomImageName();

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: randomImageName(),
      Body: buffer,
      ACL: 'public-read'
    };

    const { Location, Key } = await s3.upload(uploadParams).promise();

    const db = await DatabaseConnection.connect(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const imageDocument = {
      originalName: req.file.originalname!,
      name: Key,
      url: Location,
      date: new Date().toISOString(),
      size: req.file.size,
      mimetype: req.file.mimetype,
    };

    const { insertedId, acknowledged } = await collection.insertOne(imageDocument);

    if (!acknowledged) {
      return res.status(500).json({ message: 'Error inserting document into MongoDB' });
    };

    const returnImage = { ...imageDocument, _id: insertedId }

    res.status(201).json({ message: 'Image uploaded successfully', image: returnImage });

  } catch (error) {
    res.status(500).json({ message: 'Error uploading image' });
    console.log('Error uploading image:', error);
  }
});