const { gql } = require('apollo-server')

module.exports = gql`
  type User {
    username: String
    email: String
    token: String!
    createdAt: String!
  }
  type Errors {
    field: String
    message: String!
    status: Int!
  }
  type AuthResponse {
    ok: Boolean!
    errors: [Errors!]  #errors array can be null too so no need of ! after []
    user: User
  }
  type Query {
    getUsers: [User]!
    login(emailorusername: String, password: String): AuthResponse!
  }
  type Mutation {
    register(username: String!, email: String!, password: String!): AuthResponse!
  }
`