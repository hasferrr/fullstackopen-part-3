const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('req-body', req => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))


app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then(persons => {
      res.json(persons)
    })
})

app.get('/info', (req, res) => {
  Person
    .count()
    .then(num => {
      res.send(`<p>Phonebook has info for ${num} people</p><p>${Date()}</p>`)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person
    .findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const newPerson = req.body

  if (!newPerson.name || !newPerson.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }

  const person = new Person({
    name: newPerson.name,
    number: newPerson.number
  })

  person.save().then(addedPerson => {
    res.json(addedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    req.params.id,
    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})


// Error Handler

const typeOfError = error => {
  const type = {}
  if (error.errors.name) {
    type.name = error.errors.name.kind
  }
  if (error.errors.number) {
    type.number = error.errors.number.kind
  }
  return type
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message, type: typeOfError(error) })
  }
  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(errorHandler)
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)