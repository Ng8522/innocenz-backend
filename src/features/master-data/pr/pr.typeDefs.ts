export const typeDefs = `#graphql
  type Pr {
    id: ID!
    userId: ID!
    icNo: String!
    prNo: String!
    prAgency: ID!
    profileImage: String
    comcardImages: JSON!
    language: [String!]!
    bwhMeasurements: JSON!
    status: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
  }

  type PrPaginatedResponse {
    query: [Pr!]!
    pagination: Pagination!
  }

  input PrFilterInput {
    icNo: String
    prNo: String
    status: String
    userId: ID
    prAgency: ID
  }

  input CreatePrInput {
    user: CreateUserInput!
    icNo: String!
    prNo: String!
    prAgency: ID!
    profileImage: String
    comcardImages: JSON!
    language: [String!]
    bwhMeasurements: JSON!
    status: String
  }

  input UpdatePrInput {
    userId: ID
    icNo: String
    prNo: String
    prAgency: ID
    profileImage: String
    comcardImages: JSON
    language: [String!]
    bwhMeasurements: JSON
    status: String
  }

  extend type Query {
    prs(filter: PrFilterInput, pageSize: Int, pageNumber: Int): PrPaginatedResponse! @auth
    pr(id: ID!): Pr @auth
  }

  extend type Mutation {
    createPr(input: CreatePrInput!): Pr! @auth
    updatePr(id: ID!, input: UpdatePrInput!): Pr @auth
    deletePr(id: ID!): Pr @auth
  }
`;
