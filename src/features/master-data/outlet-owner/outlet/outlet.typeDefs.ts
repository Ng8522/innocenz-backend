export const typeDefs = `#graphql
  type Outlet {
    id: ID!
    outletOwnerId: ID!
    outletName: String!
    outletAddress: String!
    outletContactNo: String!
    outletEmail: String!
    outletLogo: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
  }

  type OutletPaginatedResponse {
    query: [Outlet!]!
    pagination: Pagination!
  }

  input OutletFilterInput {
    outletName: String
    status: String
    outletOwnerId: ID
    outletEmail: String
  }

  input CreateOutletInput {
    outletOwnerId: ID!
    outletName: String!
    outletAddress: String!
    outletContactNo: String!
    outletEmail: String!
    outletLogo: String!
    status: String
  }

  input UpdateOutletInput {
    outletOwnerId: ID
    outletName: String
    outletAddress: String
    outletContactNo: String
    outletEmail: String
    outletLogo: String
    status: String
  }

  extend type Query {
    outlets(filter: OutletFilterInput, pageSize: Int, pageNumber: Int): OutletPaginatedResponse! @auth
    outlet(id: ID!): Outlet @auth
  }

  extend type Mutation {
    createOutlet(input: CreateOutletInput!): Outlet! @auth
    updateOutlet(id: ID!, input: UpdateOutletInput!): Outlet @auth
    deleteOutlet(id: ID!): Outlet @auth
  }
`;
