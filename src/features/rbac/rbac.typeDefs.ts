export const typeDefs = `#graphql
  type RbacRole {
    roleId: ID!
    roleName: String!
    status: String!
    isParentFrom: String
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
    permissions: [RolePermissionInfo!]!
  }

  type RbacModule {
    moduleId: ID!
    moduleName: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
    permissions: [RbacPermission!]!
  }

  type RbacPermission {
    permissionId: ID!
    moduleId: ID!
    permissionName: String!
    description: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    createdBy: String!
    updatedBy: String!
  }

  type RolePermissionInfo {
    id: ID!
    roleId: ID!
    permissionId: ID!
    permissionName: String!
    moduleId: ID!
    moduleName: String!
  }

  type MyAccessPermission {
    roleId: ID!
    roleName: String!
    permissionId: ID!
    permissionName: String!
    moduleId: ID!
    moduleName: String!
  }

  input CreateModuleInput {
    moduleName: String!
    status: String
  }

  input UpdateModuleInput {
    moduleName: String
    status: String
  }

  input CreateRoleInput {
    roleName: String!
    status: String
    isParentFrom: String
  }

  input UpdateRoleInput {
    roleName: String
    status: String
    isParentFrom: String
  }

  input CreatePermissionInput {
    moduleId: ID!
    permissionName: String!
    description: String!
    status: String
  }

  input UpdatePermissionInput {
    moduleId: ID
    permissionName: String
    description: String
    status: String
  }

  input CreateRolePermissionInput {
    roleId: ID!
    permissionId: ID!
  }

  extend type Query {
    roles: [RbacRole!]! @auth
    role(id: ID!): RbacRole @auth
    modules: [RbacModule!]! @auth
    module(id: ID!): RbacModule @auth
    permissions: [RbacPermission!]! @auth
    rolePermissions(roleId: ID!): [RolePermissionInfo!]! @auth
    myAccess: [MyAccessPermission!]! @auth
  }

  extend type Mutation {
    createModule(input: CreateModuleInput!): RbacModule! @auth
    updateModule(id: ID!, input: UpdateModuleInput!): RbacModule @auth
    deleteModule(id: ID!): RbacModule @auth
    createRole(input: CreateRoleInput!): RbacRole! @auth
    updateRole(id: ID!, input: UpdateRoleInput!): RbacRole @auth
    deleteRole(id: ID!): RbacRole @auth
    createPermission(input: CreatePermissionInput!): RbacPermission! @auth
    updatePermission(id: ID!, input: UpdatePermissionInput!): RbacPermission @auth
    deletePermission(id: ID!): RbacPermission @auth
    createRolePermission(input: CreateRolePermissionInput!): RolePermissionInfo! @auth
    syncRolePermissions(roleId: ID!, permissionIds: [ID!]!): [RolePermissionInfo!]! @auth
    deleteRolePermission(id: ID!): Boolean! @auth
  }
`;
