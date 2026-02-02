package com.transport.tms.controller;

import com.transport.tms.dto.AuthResponse;
import com.transport.tms.dto.PaginatedShipments;
import com.transport.tms.dto.PaginatedUsers;
import com.transport.tms.dto.input.*;
import com.transport.tms.mapper.ShipmentMapper;
import com.transport.tms.mapper.UserMapper;
import com.transport.tms.model.*;
import com.transport.tms.service.AuthService;
import com.transport.tms.service.ShipmentService;
import com.transport.tms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ShipmentMapper shipmentMapper;

    // ==================== Authentication ====================

    @MutationMapping
    public AuthResponse register(@Argument @Valid RegisterInput registerInput) {
        User user = userMapper.toEntity(registerInput);
        return authService.register(user, registerInput.getPassword());
    }

    @MutationMapping
    public AuthResponse login(@Argument @Valid LoginInput loginInput) {
        return authService.login(loginInput.getEmail(), loginInput.getPassword());
    }

    @QueryMapping
    @Transactional(readOnly = true)
    public User me() {
        // In production, get email from security context (JWT token)
        // For now, return admin user for testing
        return authService.getCurrentUser("admin@transport.com");
    }

    // ==================== User Queries ====================

    @QueryMapping
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public User user(@Argument String id) {
        return userService.findById(id);
    }

    @QueryMapping
    @Transactional(readOnly = true)
    public List<User> drivers() {
        return userService.findDrivers();
    }

    // ==================== User Mutations ====================

    @MutationMapping
    public User createUser(@Argument @Valid CreateUserInput createUserInput) {
        User user = userMapper.toEntity(createUserInput);
        return userService.createUser(user, createUserInput.getPassword());
    }

    @MutationMapping
    public User updateUser(@Argument @Valid UpdateUserInput updateUserInput) {
        User user = userService.findById(updateUserInput.getId());
        userMapper.updateEntityFromInput(updateUserInput, user);
        return userService.updateUser(user);
    }

    @MutationMapping
    public User deleteUser(@Argument String id) {
        return userService.deleteUser(id);
    }

    // ==================== Shipment Queries ====================

    @QueryMapping
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public Shipment shipment(@Argument String id) {
        return shipmentService.findById(id);
    }

    @QueryMapping
    @Transactional(readOnly = true)
    public Shipment trackShipment(@Argument String trackingNumber) {
        return shipmentService.findByTrackingNumber(trackingNumber);
    }

    // ==================== Shipment Mutations ====================

    @MutationMapping
    @Transactional
    public Shipment createShipment(@Argument @Valid CreateShipmentInput createShipmentInput) {
        Shipment shipment = shipmentMapper.toEntity(createShipmentInput);
        // In production, get userId from security context
        return shipmentService.create(shipment, "admin-user-id");
    }

    @MutationMapping
    @Transactional
    public Shipment updateShipment(@Argument @Valid UpdateShipmentInput updateShipmentInput) {
        Shipment shipment = shipmentService.findById(updateShipmentInput.getId());
        shipmentMapper.updateEntityFromInput(updateShipmentInput, shipment);
        return shipmentService.updateShipment(shipment);
    }

    @MutationMapping
    @Transactional
    public Shipment removeShipment(@Argument String id) {
        return shipmentService.delete(id);
    }

    @MutationMapping
    @Transactional
    public Shipment assignDriver(@Argument String shipmentId, @Argument String driverId) {
        return shipmentService.assignDriver(shipmentId, driverId);
    }

    @MutationMapping
    @Transactional
    public Shipment flagShipment(@Argument String id) {
        return shipmentService.flagShipment(id);
    }

    // ==================== Health Check ====================

    @QueryMapping
    public String health() {
        return "OK";
    }
}
