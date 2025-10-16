import { createConnection } from 'typeorm';
import { User } from '../models/User';
import { League } from '../models/League';

export const setupTestDB = async () => {
  const connection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    entities: [User, League],
    synchronize: true,
  });

  return connection;
};

export const teardownTestDB = async (connection) => {
  await connection.close();
};
