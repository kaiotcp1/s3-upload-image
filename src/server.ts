import { DatabaseConnection } from '../src/database/database-connection'
import { app } from './app'

const PORT = process.env.PORT || 8000;
const DB_NAME = process.env.MONGO_DB_NAME || '';
const COLLECTION_NAME = process.env.MONGO_DB_COLLECTION_NAME || '';

DatabaseConnection.connect(DB_NAME).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
