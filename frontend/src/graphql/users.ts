import { gql } from '@apollo/client';

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
      fullName
      role
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
      fullName
      role
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      firstName
      lastName
      fullName
      role
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      email
      firstName
      lastName
      fullName
      role
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;
