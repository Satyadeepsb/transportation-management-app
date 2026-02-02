package com.transport.tms.controller;

import com.transport.tms.dto.AuthResponse;
import com.transport.tms.dto.PaginatedShipments;
import com.transport.tms.dto.PaginatedUsers;
import com.transport.tms.model.*;
import com.transport.tms.service.AuthService;
import com.transport.tms.service.ShipmentService;
import com.transport.tms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Controller
public class GraphQLController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private ShipmentService shipmentService;

    // ==================== Authentication ====================

    @MutationMapping
    public AuthResponse register(@Argument Map<String, Object> registerInput) {
        String email = (String) registerInput.get("email");
        String password = (String) registerInput.get("password");
        String firstName = (String) registerInput.get("firstName");
        String lastName = (String) registerInput.get("lastName");
        String roleStr = (String) registerInput.get("role");
        UserRole role = roleStr != null ? UserRole.valueOf(roleStr) : null;
        String phone = (String) registerInput.get("phone");

        return authService.register(email, password, firstName, lastName, role, phone);
    }

    @MutationMapping
    public AuthResponse login(@Argument Map<String, Object> loginInput) {
        String email = (String) loginInput.get("email");
        String password = (String) loginInput.get("password");

        return authService.login(email, password);
    }

    @QueryMapping
    public User me() {
        // In production, get email from security context (JWT token)
        // For now, return admin user for testing
        return authService.getCurrentUser("admin@transport.com");
    }

    // ==================== User Queries ====================

    @QueryMapping
    public PaginatedUsers users(@Argument Map<String, Object> filter,
                                @Argument Map<String, Object> pagination) {
        UserRole role = filter != null && filter.get("role") != null ?
                UserRole.valueOf((String) filter.get("role")) : null;
        Boolean isActive = filter != null ? (Boolean) filter.get("isActive") : null;
        String search = filter != null ? (String) filter.get("search") : null;

        Integer page = pagination != null ? (Integer) pagination.getOrDefault("page", 1) : 1;
        Integer limit = pagination != null ? (Integer) pagination.getOrDefault("limit", 10) : 10;
        String sortBy = pagination != null ? (String) pagination.getOrDefault("sortBy", "createdAt") : "createdAt";
        String sortOrder = pagination != null ? (String) pagination.getOrDefault("sortOrder", "desc") : "desc";

        return userService.findAll(role, isActive, search, page, limit, sortBy, sortOrder);
    }

    @QueryMapping
    public User user(@Argument String id) {
        return userService.findById(id);
    }

    @QueryMapping
    public List<User> drivers() {
        return userService.findDrivers();
    }

    // ==================== User Mutations ====================

    @MutationMapping
    public User createUser(@Argument Map<String, Object> createUserInput) {
        String email = (String) createUserInput.get("email");
        String password = (String) createUserInput.get("password");
        String firstName = (String) createUserInput.get("firstName");
        String lastName = (String) createUserInput.get("lastName");
        UserRole role = UserRole.valueOf((String) createUserInput.get("role"));
        String phone = (String) createUserInput.get("phone");

        return userService.createUser(email, password, firstName, lastName, role, phone);
    }

    @MutationMapping
    public User updateUser(@Argument Map<String, Object> updateUserInput) {
        String id = (String) updateUserInput.get("id");
        String email = (String) updateUserInput.get("email");
        String firstName = (String) updateUserInput.get("firstName");
        String lastName = (String) updateUserInput.get("lastName");
        String roleStr = (String) updateUserInput.get("role");
        UserRole role = roleStr != null ? UserRole.valueOf(roleStr) : null;
        String phone = (String) updateUserInput.get("phone");
        Boolean isActive = (Boolean) updateUserInput.get("isActive");

        return userService.updateUser(id, email, firstName, lastName, role, phone, isActive);
    }

    @MutationMapping
    public User deleteUser(@Argument String id) {
        return userService.deleteUser(id);
    }

    // ==================== Shipment Queries ====================

    @QueryMapping
    public PaginatedShipments shipments(@Argument Map<String, Object> filter,
                                       @Argument Map<String, Object> pagination) {
        ShipmentStatus status = filter != null && filter.get("status") != null ?
                ShipmentStatus.valueOf((String) filter.get("status")) : null;
        String trackingNumber = filter != null ? (String) filter.get("trackingNumber") : null;
        String createdById = filter != null ? (String) filter.get("createdById") : null;
        String driverId = filter != null ? (String) filter.get("driverId") : null;
        String vehicleTypeStr = filter != null ? (String) filter.get("vehicleType") : null;
        VehicleType vehicleType = vehicleTypeStr != null ? VehicleType.valueOf(vehicleTypeStr) : null;

        Integer page = pagination != null ? (Integer) pagination.getOrDefault("page", 1) : 1;
        Integer limit = pagination != null ? (Integer) pagination.getOrDefault("limit", 10) : 10;
        String sortBy = pagination != null ? (String) pagination.getOrDefault("sortBy", "createdAt") : "createdAt";
        String sortOrder = pagination != null ? (String) pagination.getOrDefault("sortOrder", "desc") : "desc";

        return shipmentService.findAll(status, trackingNumber, createdById, driverId,
                vehicleType, page, limit, sortBy, sortOrder);
    }

    @QueryMapping
    public Shipment shipment(@Argument String id) {
        return shipmentService.findById(id);
    }

    @QueryMapping
    public Shipment trackShipment(@Argument String trackingNumber) {
        return shipmentService.findByTrackingNumber(trackingNumber);
    }

    // ==================== Shipment Mutations ====================

    @MutationMapping
    public Shipment createShipment(@Argument Map<String, Object> createShipmentInput) {
        Shipment shipment = new Shipment();

        // Shipper information
        shipment.setShipperName((String) createShipmentInput.get("shipperName"));
        shipment.setShipperPhone((String) createShipmentInput.get("shipperPhone"));
        shipment.setShipperEmail((String) createShipmentInput.get("shipperEmail"));
        shipment.setShipperAddress((String) createShipmentInput.get("shipperAddress"));
        shipment.setShipperCity((String) createShipmentInput.get("shipperCity"));
        shipment.setShipperState((String) createShipmentInput.get("shipperState"));
        shipment.setShipperZip((String) createShipmentInput.get("shipperZip"));

        // Consignee information
        shipment.setConsigneeName((String) createShipmentInput.get("consigneeName"));
        shipment.setConsigneePhone((String) createShipmentInput.get("consigneePhone"));
        shipment.setConsigneeEmail((String) createShipmentInput.get("consigneeEmail"));
        shipment.setConsigneeAddress((String) createShipmentInput.get("consigneeAddress"));
        shipment.setConsigneeCity((String) createShipmentInput.get("consigneeCity"));
        shipment.setConsigneeState((String) createShipmentInput.get("consigneeState"));
        shipment.setConsigneeZip((String) createShipmentInput.get("consigneeZip"));

        // Cargo information
        shipment.setCargoDescription((String) createShipmentInput.get("cargoDescription"));
        shipment.setWeight(((Number) createShipmentInput.get("weight")).doubleValue());
        shipment.setDimensions((String) createShipmentInput.get("dimensions"));
        shipment.setVehicleType(VehicleType.valueOf((String) createShipmentInput.get("vehicleType")));

        // Financial
        shipment.setEstimatedRate(((Number) createShipmentInput.get("estimatedRate")).doubleValue());
        shipment.setCurrency((String) createShipmentInput.getOrDefault("currency", "USD"));

        // Dates
        shipment.setPickupDate(LocalDate.parse((String) createShipmentInput.get("pickupDate")));
        shipment.setEstimatedDelivery(LocalDate.parse((String) createShipmentInput.get("estimatedDelivery")));

        shipment.setNotes((String) createShipmentInput.get("notes"));

        // In production, get userId from security context
        return shipmentService.create(shipment, "admin-user-id");
    }

    @MutationMapping
    public Shipment updateShipment(@Argument Map<String, Object> updateShipmentInput) {
        String id = (String) updateShipmentInput.get("id");
        String statusStr = (String) updateShipmentInput.get("status");
        ShipmentStatus status = statusStr != null ? ShipmentStatus.valueOf(statusStr) : null;
        Double actualRate = updateShipmentInput.get("actualRate") != null ?
                ((Number) updateShipmentInput.get("actualRate")).doubleValue() : null;
        String deliveryDateStr = (String) updateShipmentInput.get("deliveryDate");
        LocalDate deliveryDate = deliveryDateStr != null ? LocalDate.parse(deliveryDateStr) : null;
        String notes = (String) updateShipmentInput.get("notes");

        return shipmentService.update(id, status, actualRate, deliveryDate, notes);
    }

    @MutationMapping
    public Shipment removeShipment(@Argument String id) {
        return shipmentService.delete(id);
    }

    @MutationMapping
    public Shipment assignDriver(@Argument String shipmentId, @Argument String driverId) {
        return shipmentService.assignDriver(shipmentId, driverId);
    }

    @MutationMapping
    public Shipment flagShipment(@Argument String id) {
        return shipmentService.flagShipment(id);
    }

    // ==================== Health Check ====================

    @QueryMapping
    public String health() {
        return "OK";
    }
}
