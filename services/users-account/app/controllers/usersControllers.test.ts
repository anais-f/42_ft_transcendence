// import {jest} from '@jest/globals'
// import { handleUserCreated } from './usersControllers.ts'
// import { UsersServices } from '../services/usersServices.ts'



// jest.mock('../services/usersServices')

// describe('handleUserCreated', () => {
//   test('should create a user and return success', async () => {
//     UsersServices.createUser.mockResolvedValue(undefined)
//     const req = { body: { id_user: 1 } }
//     const res = { send: jest.fn() }
//     await handleUserCreated(req, res)
//     expect(res.send).toHaveBeenCalledWith({ success: true })
//   })

//   test('should return error if user already exists', async () => {
//     UsersServices.createUser.mockImplementation(() => { throw new Error('User exists') })
//     const req = { body: { id_user: 1 } }
//     const res = { status: jest.fn().mockReturnThis(), send: jest.fn() }
//     await handleUserCreated(req, res)
//     expect(res.status).toHaveBeenCalledWith(400)
//     expect(res.send).toHaveBeenCalledWith({ error: 'User exists' })
//   })
// })