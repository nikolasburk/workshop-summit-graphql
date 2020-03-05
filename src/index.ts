import { queryType, makeSchema, stringArg, objectType, intArg, mutationType } from 'nexus'
import { ApolloServer } from 'apollo-server'
import { PrismaClient } from '@prisma/client'
import { nexusPrismaPlugin } from 'nexus-prisma'

const prisma = new PrismaClient()

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.posts()
  },
})

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.content()
    t.model.published()
    t.model.author()
  },
})

const Query = queryType({
  definition(t) {
    t.crud.posts({ 
      pagination: true,
      filtering: true,
      ordering: true
    })

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

    t.field('feed', {
      type: 'Post',
      list: true,
      resolve: () => {
        return prisma.post.findMany({
          where: { published: true }
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

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg({ nullable: false }),
        content: stringArg(),
        authorEmail: stringArg({ nullable: false }),
      },
      resolve: (_, args) => {
        return prisma.post.create({
          data: {
            title: args.title,
            content: args.content,
            author: {
              connect: {
                email: args.authorEmail,
              },
            },
          },
        })
      },
    })

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: {
        postId: intArg({ nullable: false }),
      },
      resolve: (_, args) => {
        return prisma.post.update({
          where: { id: args.postId },
          data: { published: true },
        })
      },
    })
  }
})


const schema = makeSchema({
  types: [Query, Mutation, User, Post],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/types.ts',
  },
  typegenAutoConfig: {
    sources: [{
      alias: 'prisma',
      source: '@prisma/client'
    }]
  }
})

const server = new ApolloServer({
  schema
})
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})