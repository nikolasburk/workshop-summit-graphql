import { queryType, makeSchema } from 'nexus'
import { ApolloServer } from 'apollo-server'

const Query = queryType({
  definition(t) {
    t.field('hello', {
      type: 'String',
      resolve: () => "Hello Nexus"
    })
  }
})

const schema = makeSchema({
  types: [Query],
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