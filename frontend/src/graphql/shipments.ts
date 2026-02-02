import { gql } from '@apollo/client';

export const GET_SHIPMENTS_QUERY = gql`
  query GetShipments(
    $filter: ShipmentFilterInput
    $pagination: PaginationInput
  ) {
    shipments(filter: $filter, pagination: $pagination) {
      data {
        id
        trackingNumber
        status
        shipperName
        shipperEmail
        shipperPhone
        shipperAddress
        shipperCity
        shipperState
        shipperZip
        consigneeName
        consigneeEmail
        consigneePhone
        consigneeAddress
        consigneeCity
        consigneeState
        consigneeZip
        cargoDescription
        weight
        vehicleType
        estimatedRate
        pickupDate
        deliveryDate
        estimatedDelivery
        createdBy {
          fullName
          role
        }
        driver {
          id
          fullName
          phone
          email
        }
        createdAt
      }
      meta {
        total
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_SHIPMENT_QUERY = gql`
  query GetShipment($id: String!) {
    shipment(id: $id) {
      id
      trackingNumber
      status
      shipperName
      shipperPhone
      shipperEmail
      shipperAddress
      shipperCity
      shipperState
      shipperZip
      consigneeName
      consigneePhone
      consigneeEmail
      consigneeAddress
      consigneeCity
      consigneeState
      consigneeZip
      cargoDescription
      weight
      dimensions
      vehicleType
      estimatedRate
      actualRate
      currency
      pickupDate
      deliveryDate
      estimatedDelivery
      notes
      createdBy {
        id
        fullName
        email
        phone
      }
      driver {
        id
        fullName
        phone
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const TRACK_SHIPMENT_QUERY = gql`
  query TrackShipment($trackingNumber: String!) {
    trackShipment(trackingNumber: $trackingNumber) {
      id
      trackingNumber
      status
      shipperCity
      shipperState
      consigneeCity
      consigneeState
      pickupDate
      deliveryDate
      estimatedDelivery
      driver {
        fullName
        phone
      }
    }
  }
`;

export const CREATE_SHIPMENT_MUTATION = gql`
  mutation CreateShipment($input: CreateShipmentInput!) {
    createShipment(createShipmentInput: $input) {
      id
      trackingNumber
      status
    }
  }
`;

export const UPDATE_SHIPMENT_MUTATION = gql`
  mutation UpdateShipment($input: UpdateShipmentInput!) {
    updateShipment(updateShipmentInput: $input) {
      id
      trackingNumber
      status
      actualRate
      deliveryDate
    }
  }
`;

export const DELETE_SHIPMENT_MUTATION = gql`
  mutation DeleteShipment($id: String!) {
    removeShipment(id: $id) {
      id
      trackingNumber
    }
  }
`;

export const ASSIGN_DRIVER_MUTATION = gql`
  mutation AssignDriver($shipmentId: String!, $driverId: String!) {
    assignDriver(shipmentId: $shipmentId, driverId: $driverId) {
      id
      status
      driver {
        id
        fullName
      }
    }
  }
`;

export const GET_DRIVERS_QUERY = gql`
  query GetDrivers {
    drivers {
      id
      fullName
      phone
      email
    }
  }
`;

export const FLAG_SHIPMENT_MUTATION = gql`
  mutation FlagShipment($id: String!) {
    flagShipment(id: $id) {
      id
      trackingNumber
    }
  }
`;
