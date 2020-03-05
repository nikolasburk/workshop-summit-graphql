import { queryType, makeSchema, stringArg, objectType, intArg, mutationType } from 'nexus'
import { ApolloServer } from 'apollo-server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id')
    t.string('name', { nullable: true })
    t.string('email')
    t.field('posts', {
      list: true,
      type: 'Post',
      resolve: parent => {
        return prisma.user.findOne({
          where: { id: parent.id }
        }).posts()
      }
    })
  },
})
const Post = objectType({
  name: 'Post',
  definition(t) {
    t.int('id')
    t.string('title')
    t.string('content', { nullable: true })
    t.boolean('published')
    t.field('author', {
      type: 'User',
      resolve: parent => {
        return prisma.post.findOne({
          where: { id: parent.id }
        }).author()
      }
    })
  },
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