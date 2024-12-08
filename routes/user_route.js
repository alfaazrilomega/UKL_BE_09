import express from 'express'
import {
   getAllUser,
   getUserById,
   addUser,
   updateUser,
   deleteUser
} from '../controllers/user_controllers.js'

const app = express()

import {authorize} from '../controllers/auth_controllers.js'
import {IsAdmin} from '../middleware/role_validation.js'


app.get('/', authorize, IsAdmin, getAllUser)
app.get('/:id', authorize, IsAdmin, getUserById)
app.post('/',  addUser)
app.put('/:id', authorize, IsAdmin, updateUser)
app.delete('/:id', authorize, IsAdmin, deleteUser)

export default app