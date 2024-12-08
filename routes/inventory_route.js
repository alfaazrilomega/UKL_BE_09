import express from 'express'
import {
   getAllInventory,
   getInventoryById,
   addInventory,
   updateInventory,
   deleteInventory
} from '../controllers/inventory.controllers.js'


const app = express()

import {authorize} from '../controllers/auth_controllers.js'
import {IsAdmin} from '../middleware/role_validation.js'


app.get('/', authorize, IsAdmin, getAllInventory)
app.get('/:id', authorize, IsAdmin, getInventoryById)
app.post('/', authorize, IsAdmin, addInventory)
app.put('/:id', authorize, IsAdmin, updateInventory)
app.delete('/:id', authorize, IsAdmin,  deleteInventory)

export default app