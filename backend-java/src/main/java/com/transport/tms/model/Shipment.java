package com.transport.tms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.PENDING;

    // Shipper Information
    @Column(nullable = false)
    private String shipperName;

    @Column(nullable = false)
    private String shipperPhone;

    private String shipperEmail;

    @Column(nullable = false)
    private String shipperAddress;

    @Column(nullable = false)
    private String shipperCity;

    @Column(nullable = false)
    private String shipperState;

    @Column(nullable = false)
    private String shipperZip;

    // Consignee Information
    @Column(nullable = false)
    private String consigneeName;

    @Column(nullable = false)
    private String consigneePhone;

    private String consigneeEmail;

    @Column(nullable = false)
    private String consigneeAddress;

    @Column(nullable = false)
    private String consigneeCity;

    @Column(nullable = false)
    private String consigneeState;

    @Column(nullable = false)
    private String consigneeZip;

    // Cargo Information
    @Column(nullable = false)
    private String cargoDescription;

    @Column(nullable = false)
    private Double weight;

    private String dimensions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    // Financial
    @Column(nullable = false)
    private Double estimatedRate;

    private Double actualRate;

    @Column(nullable = false)
    private String currency = "USD";

    // Dates
    @Column(nullable = false)
    private LocalDate pickupDate;

    private LocalDate deliveryDate;

    @Column(nullable = false)
    private LocalDate estimatedDelivery;

    // Relations
    @Column(nullable = false)
    private String createdById;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdById", insertable = false, updatable = false)
    private User createdBy;

    private String driverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driverId", insertable = false, updatable = false)
    private User driver;

    @Column(length = 2000)
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void generateTrackingNumber() {
        if (trackingNumber == null) {
            trackingNumber = UUID.randomUUID().toString().replace("-", "");
        }
    }
}
