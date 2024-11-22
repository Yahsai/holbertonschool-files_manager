import pkg from 'mongodb';
const { MongoClient } = pkg;

class DBClient {
  constructor() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 27017;
    const dbDatabase = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${dbHost}:${dbPort}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect()
      .then(() => {
        this.db = this.client.db(dbDatabase);
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
      });
  }

  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    if (!this.db) {
      return 0;
    }
    return this.db.collection('users').countDocuments({});
  }

  async nbFiles() {
    if (!this.db) {
      return 0;
    }
    return this.db.collection('files').countDocuments({});
  }
}

const dbClient = new DBClient();
export default dbClient;
