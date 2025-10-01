
/* Example Users Controller

import { UserServices } from '../services/userServices';
import { UserSchema } from '../models/UsersDTO';

export const getUsers = async (req, res) => {
  const users = await UserServices.getAllUsers();
  res.send(users);
};

export const createUser = async (req, res) => {
  const parse = UserSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).send({ error: 'Invalid data' });
  }
  await UserServices.createUser(parse.data);
  res.send({ success: true });
};

 */