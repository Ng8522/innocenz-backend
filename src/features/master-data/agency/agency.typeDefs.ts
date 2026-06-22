export const typeDefs = `#graphql
  type Agency {
    id: ID!
    agencyName: String!
    agencyAddress: String!
    agencyContactNo: String!
    agencyEmail: String!
    agencyLogo: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
  }

  type AgencyPaginatedResponse {
    query: [Agency!]!
    pagination: Pagination!
  }

  input AgencyFilterInput {
    agencyName: String
    status: String
    agencyEmail: String
  }

  input CreateAgencyInput {
    agencyName: String!
    agencyAddress: String!
    agencyContactNo: String!
    agencyEmail: String!
    agencyLogo: String!
    status: String
  }

  input UpdateAgencyInput {
    agencyName: String
    agencyAddress: String
    agencyContactNo: String
    agencyEmail: String
    agencyLogo: String
    status: String
  }

  extend type Query {
    agencies(filter: AgencyFilterInput, pageSize: Int, pageNumber: Int): AgencyPaginatedResponse! @auth
    agency(id: ID!): Agency @auth
  }

  extend type Mutation {
    createAgency(input: CreateAgencyInput!): Agency! @auth
    updateAgency(id: ID!, input: UpdateAgencyInput!): Agency @auth
    deleteAgency(id: ID!): Agency @auth
  }
`;
