import { queryType, makeSchema, stringArg, objectType, intArg } from 'nexus'
import { ApolloServer } from 'apollo-server'

const users = [{
  id: 1,
  name: "Alice",
  email: "alice@prisma.io"
}, {
  id: 2,
  name: "Bob",
  email: "bob@prisma.io"
}]

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
      resolve: () => users
    })

    t.field('user', {
      type: 'User',
      nullable: true,
      args: {
        id: intArg({ required: true })
      },
      resolve: (_, args) => {
        return users.find(u => u.id === args.id)
      }
    })
  }
})

const schema = makeSchema({
  types: [Query, User],
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