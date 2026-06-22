export const typeDefs = `#graphql
  type AgencyUser {
    id: ID!
    agencyId: ID!
    userId: ID!
    agencyName: String!
    userName: String!
    userEmail: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
  }

  type AgencyUserPaginatedResponse {
    query: [AgencyUser!]!
    pagination: Pagination!
  }

  input AgencyUserFilterInput {
    agencyId: ID
    userId: ID
  }

  input CreateAgencyUserInput {
    agencyId: ID!
    userId: ID!
  }

  extend type Query {
    agencyUsers(filter: AgencyUserFilterInput, pageSize: Int, pageNumber: Int): AgencyUserPaginatedResponse! @auth
    agencyUser(agencyId: ID!, userId: ID!): AgencyUser @auth
  }

  extend type Mutation {
    createAgencyUser(input: CreateAgencyUserInput!): AgencyUser! @auth
    updateAgencyUser(agencyId: ID!, userId: ID!): AgencyUser @auth
    deleteAgencyUser(agencyId: ID!, userId: ID!): AgencyUser @auth
  }
`;
