package com.transport.tms.service;

import com.transport.tms.dto.PaginatedShipments;
import com.transport.tms.dto.PaginationMeta;
import com.transport.tms.model.Shipment;
import com.transport.tms.model.ShipmentStatus;
import com.transport.tms.model.VehicleType;
import com.transport.tms.repository.ShipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    public PaginatedShipments findAll(ShipmentStatus status, String trackingNumber,
                                     String createdById, String driverId,
                                     VehicleType vehicleType,
                                     Integer page, Integer limit,
                                     String sortBy, String sortOrder) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageable = PageRequest.of(page - 1, limit, sort);

        Page<Shipment> shipmentPage;

        if (status != null) {
            shipmentPage = shipmentRepository.findAll((root, query, cb) -> cb.equal(root.get("status"), status), pageable);
        } else {
            shipmentPage = shipmentRepository.findAll(pageable);
        }

        PaginationMeta meta = new PaginationMeta(
                (int) shipmentPage.getTotalElements(),
                page,
                limit,
                shipmentPage.getTotalPages(),
                shipmentPage.hasNext(),
                shipmentPage.hasPrevious()
        );

        return new PaginatedShipments(shipmentPage.getContent(), meta);
    }

    public Shipment findById(String id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
    }

    public Shipment findByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Shipment not found with tracking number: " + trackingNumber));
    }

    @Transactional
    public Shipment create(Shipment shipment, String userId) {
        shipment.setCreatedById(userId);
        shipment.setStatus(ShipmentStatus.PENDING);
        return shipmentRepository.save(shipment);
    }

    @Transactional
    public Shipment update(String id, ShipmentStatus status, Double actualRate,
                          LocalDate deliveryDate, String notes) {
        Shipment shipment = findById(id);

        if (status != null) shipment.setStatus(status);
        if (actualRate != null) shipment.setActualRate(actualRate);
        if (deliveryDate != null) shipment.setDeliveryDate(deliveryDate);
        if (notes != null) shipment.setNotes(notes);

        return shipmentRepository.save(shipment);
    }

    @Transactional
    public Shipment delete(String id) {
        Shipment shipment = findById(id);
        shipmentRepository.delete(shipment);
        return shipment;
    }

    @Transactional
    public Shipment assignDriver(String shipmentId, String driverId) {
        Shipment shipment = findById(shipmentId);
        shipment.setDriverId(driverId);
        shipment.setStatus(ShipmentStatus.ASSIGNED);
        return shipmentRepository.save(shipment);
    }

    @Transactional
    public Shipment flagShipment(String id) {
        Shipment shipment = findById(id);
        String flagNote = "[FLAGGED FOR REVIEW - " + Instant.now() + "]";
        String currentNotes = shipment.getNotes();
        shipment.setNotes(currentNotes != null ? currentNotes + "\n" + flagNote : flagNote);
        return shipmentRepository.save(shipment);
    }
}
