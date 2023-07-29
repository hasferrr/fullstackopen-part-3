require('dotenv').config()
const mongoose = require('mongoose')

// Connect to Database
const url = process.env.MONGODB_URI
console.log('connecting to database')
mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(response => {
    console.log('conected to MongoBD')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

// Define schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// Define model
const Person = mongoose.model('Person', personSchema)

module.exports = Person