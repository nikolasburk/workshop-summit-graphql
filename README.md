# Hello Nexus

## How to use

### 1. Download example & install dependencies

Clone this repository:

```
git clone git@github.com:nikolasburk/hello-nexus.git --depth=1
```

Install npm dependencies:

```
cd hello-nexus
npm install
```


### 2. Start the GraphQL server

Launch your GraphQL server with this command:

```
npm run dev
```

Navigate to [http://localhost:4000](http://localhost:4000) in your browser to explore the API of your GraphQL server in a [GraphQL Playground](https://github.com/prisma/graphql-playground).

> The schema that specifies the API operations of your GraphQL server is defined in [`./schema.graphql`](./schema.graphql). 