import { MongoClient, Collection, Db } from "mongodb";

export class DatabaseConnection {
  private static client: MongoClient;
  private static db: Db | null = null;
  private static readonly mongoUrl: string = process.env.MONGO_DB_URL_CONNECTION || "mongodb://localhost:27017";

  static async connect(databaseName: string): Promise<Db> {
    if (!this.client) {
      this.client = new MongoClient(this.mongoUrl);
      await this.client.connect();
    }

    if (!this.db) {
      this.db = this.client.db(databaseName);
    }

    return this.db;
  }

  static async getCollection<T extends Document>(databaseName: string, collectionName: string): Promise<Collection<T>> {
    const db = await this.connect(databaseName);
    return db.collection<T>(collectionName);
  }

  // Desconecta do MongoDB
  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null!;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }
}
