import { queryType, makeSchema, stringArg, objectType, intArg, mutationType } from 'nexus'
import { ApolloServer } from 'apollo-server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id')
    t.string('name')
    t.string('email')
  }
})

const Query = queryType({
  definition(t) {
    t.field('users', {
      type: 'User',
      list: true,
      resolve: () => {
        return prisma.user.findMany()
      }
    })

    t.field('user', {
      type: 'User',
      nullable: true,
      args: {
        id: intArg({ required: true })
      },
      resolve: (_, args) => {
        return prisma.user.findOne({
          where: { id: args.id }
        })
      }
    })
  }
})

const Mutation = mutationType({
  definition(t) {
    t.field('signupUser', {
      type: 'User',
      args: {
        name: stringArg(),
        email: stringArg()
      },
      resolve: (_, args) => {
        return prisma.user.create({
          data: {
            name: args.name,
            email: args.email
          }
        })
      }
    })
  }
})


const schema = makeSchema({
  types: [Query, Mutation, User],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/types.ts'
  }
})

const server = new ApolloServer({
  schema
})
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})