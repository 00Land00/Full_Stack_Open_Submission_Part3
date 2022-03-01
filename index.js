require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

/*
const tinyFormat = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}

app.use(morgan(tinyFormat))
*/

// better solution based on what the exercise mentioned:
morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(people => {
    response.json(people)
  }).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({}).then(people => {
    response.send(`<p>Phonebook has info for ${people.length} people</p><p>${new Date(Date.now())}</p>`)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'missing name or phone number'
    })
  }

  const person = new Person({
    'name': body.name,
    'number': body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    'name': body.name,
    'number': body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' }).then(updatedPerson => {
    response.json(updatedPerson)
  }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(400).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (er, req, res, next) => {
  console.error('yo', er.message)

  if (er.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (er.name === 'ValidationError') {
    return res.status(400).json({ error: er.message })
  }

  next(er)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
