import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        fullName
        role
        phone
        isActive
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $role: UserRole
    $phone: String
  ) {
    register(
      registerInput: {
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
        role: $role
        phone: $phone
      }
    ) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        fullName
        role
        phone
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      fullName
      role
      phone
      isActive
    }
  }
`;
