export const typeDefs = `#graphql
  type OutletOwner {
    id: ID!
    userId: ID!
    email: String!
    name: String!
    contactNo: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
  }

  type OutletOwnerPaginatedResponse {
    query: [OutletOwner!]!
    pagination: Pagination!
  }

  input CreateOutletOwnerInput {
    user: CreateUserInput!
  }

  extend type Query {
    outletOwners(pageSize: Int, pageNumber: Int): OutletOwnerPaginatedResponse! @auth
    outletOwner(id: ID!): OutletOwner @auth
  }

  extend type Mutation {
    createOutletOwner(input: CreateOutletOwnerInput!): OutletOwner! @auth
  }
`;
