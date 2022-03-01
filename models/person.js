const mongoose = require('mongoose')

// eslint-disable-next-line no-undef
const url = process.env.MONGODB_URI
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log(`error connecting to MongoDB: ${error.message}`)
  })

const checkPhoneNum = val => {
  let isValidPhoneNum1 = /\d{2}-\d{6,}/.test(val)
  let isValidPhoneNum2 = /\d{3}-\d{6,}/.test(val)
  return isValidPhoneNum1 || isValidPhoneNum2
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: checkPhoneNum,
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})



personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)