const { User } = require('../models')  // doubt
const argon2 = require('argon2');
const createErrors = require('http-errors')
const jwt = require('jsonwebtoken')
require('dotenv').config();

let errors = []
// function checkError () { 

// }

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll()
        return users
      } catch (err) {
        console.log(err)
      }
    },
    login: async(_, {emailorusername, password}) => {
      try {
        const user = await User.findOne().or([{email: emailorusername}, {username: emailorusername}])

        if(!user) {
          throw createErrors.Conflict("This user doesn't exist")
        }

        const result = await argon2.verify(user.password, password)

        if(!result) {
          throw createErrors.Unauthorized("You entered wrong password")
        }

        return {
          ok: true,
          user
        }
      } catch (err) {
        errors.push({ message: err.message, status: err.status })

        return {
          ok: false,
          errors
        }
      }
    }
  },
  Mutation: {
    register: async (parent, { username, email, password }) => {  // what is parent ?
      try {
        const checkUser = await User.findOne({
          where: {username, email}
        })

        if(checkUser) {
          createErrors.Unauthorized("This user already exists")
        }

        const hashedPassword = await argon2.hash(password);

        const user = await User.create({
          username,
          email,
          hashedPassword
        })

        const token = jwt.sign({ username, email }, process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' })

        return {
          ok: true,
          user: {
            ...user.toJSON(),
            token,
            createdAt: user.createdAt.toISOString()
          }
        };  /* this is like response which will contain a "data" field so user.data will contain all the info (actually user
        will contain a lot other stuff too like some functions etc but when we write return infront of user her it doesnt return user but rather returns user.toJSON*/
      } catch (err) {
        if(err.name === "SequelizeValidationError") {
            err.errors.forEach((e) => {
              errors.push({ field: e.path, message: e.msg, status: e.status })
            })
        } else if (err.name === "SequelizeUniqueConstraintError") {
            err.errors.forEach((e) => {
              errors.push({ field: e.path, message: e.msg, status: e.status })
            })
        } else if(err.name === "JsonWebTokenError"){
            errors.push({ message: "Unauthorised User", status: err.status })
        } else {
          errors.push({ message: err.message, status: err.status })
        }
        return {
          ok: false, errors
        }
      }
    }
  }
}