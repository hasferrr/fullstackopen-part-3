const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const database = 'phonebook'

const url =
  `mongodb+srv://hasferrr:${password}@cluster0.1swslkp.mongodb.net/${database}?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// Define schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

// Define model
const Person = mongoose.model('Person', personSchema)

// Fetch all
if (process.argv.length === 3) {
  Person
    .find({})
    .then(persons => {
      console.log('phonebook:')
      persons.forEach(person => {
        console.log(person.name, person.number)
      })
      mongoose.connection.close()
    })
}

// Add phonebook
if (process.argv.length === 5) {
  const person = new Person({
    'name': process.argv[3],
    'number': process.argv[4]
  })

  person
    .save()
    .then(addedPerson => {
      console.log(`added ${addedPerson.name} number ${addedPerson.number} to phonebook`)
      mongoose.connection.close()
    })
}
