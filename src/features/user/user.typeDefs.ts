export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String
    phoneNum: String
    profileImage: String
    accName: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
  }

  type UserPaginatedResponse {
    query: [User!]!
    pagination: Pagination!
  }

  input UserFilterInput {
    id: ID
    email: String
    phoneNum: String
    accName: String
    status: String
    roleId: ID
    startDate: String
    endDate: String
  }

  enum UserSortField {
    CREATED_AT
    UPDATED_AT
    ACC_NAME
    EMAIL
    STATUS
  }

  enum SortDirection {
    ASC
    DESC
  }

  input UserSortInput {
    field: UserSortField
    direction: SortDirection
  }

  input CreateUserInput {
    accName: String!
    email: String
    phoneNum: String
    profileImage: String
  }

  extend type Query {
    users(
      filter: UserFilterInput
      pageSize: Int
      pageNumber: Int
      sort: UserSortInput
    ): UserPaginatedResponse! @auth
    user(id: ID!): User @auth
  }
`;
