import { MongoClient, ObjectId } from 'mongodb';
import sha1 from 'sha1';

class DBClient {
  constructor() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 27017;
    const dbDatabase = process.env.DB_DATABASE || 'files_manager';

    this.isConnected = false; // Nueva propiedad para rastrear el estado de conexión

    MongoClient.connect(`mongodb://${dbHost}:${dbPort}`)
      .then((client) => {
        this.client = client;
        this.db = client.db(dbDatabase);
        this.usersColl = this.db.collection('users');
        this.filesColl = this.db.collection('files');
        this.isConnected = true; // Marcar como conectado
      })
      .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
      });
  }

  isAlive() {
    return this.isConnected; // Utilizar la nueva propiedad
  }

  async nbUsers() {
    return this.usersColl.countDocuments({});
  }

  async userByEmail(email) {
    return this.usersColl.findOne({ email });
  }

  async userById(id) {
    return this.usersColl.findOne({ _id: ObjectId(id.toString()) });
  }

  async userId(email) {
    const userObject = await this.userByEmail(email);
    return userObject ? userObject._id : null;
  }

  async addUser(email, password) {
    return this.usersColl.insertOne({ email, password: sha1(password) });
  }

  async validCredentials(email, password) {
    const matches = await this.usersColl.find({ email, password: sha1(password) }).toArray();
    return !!matches.length;
  }

  async nbFiles() {
    return this.filesColl.countDocuments({});
  }

  async fileWithID(id) {
    let _id;
    try {
      _id = ObjectId(id);
    } catch (error) {
      return null;
    }
    return this.filesColl.findOne({ _id });
  }

  async addFile(file) {
    return this.filesColl.insertOne(file);
  }

  async findFiles(userId, parentId) {
    const query = {};

    try {
      query.userId = ObjectId(userId);
    } catch (error) {
      return null;
    }
    if (parentId) {
      try {
        query.parentId = ObjectId(parentId);
      } catch (error) {
        return null;
      }
    }
    return this.filesColl.find(query).toArray();
  }

  async findUserFile(userId, id) {
    const query = {};

    try {
      query.userId = ObjectId(userId);
      query._id = ObjectId(id);
    } catch (error) {
      return null;
    }
    return this.filesColl.findOne(query);
  }

  async setFilePublic(userId, id, isPublic) {
    const filter = {};
    try {
      filter.userId = ObjectId(userId);
      filter._id = ObjectId(id);
    } catch (error) {
      return null;
    }
    return this.filesColl.updateOne(filter, { $set: { isPublic } });
  }
}

const dbClient = new DBClient();
export default dbClient;
