const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

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


let people = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/persons', (request, response) => {
  response.json(people)
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${people.length} people</p><p>${new Date(Date.now())}</p>`)
})

app.get('/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = people.find(person => person.id === id)

  if (!person) {
    return response.status(404).end()
  }
  response.json(person)
})

app.delete('/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  people = people.filter(person =>  person.id !== id)

  response.status(204).end()
})

app.post('/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'missing name or phone number'
    })
  }
  
  const checkDupeNames = people.some(person => person.name == body.name)
  if (checkDupeNames) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    "id": Math.floor(Math.random() * 100000),
    "name": body.name,
    "number": body.number
  }

  people = people.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
