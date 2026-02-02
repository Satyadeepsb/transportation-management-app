package com.transport.tms.dto.input;

import com.transport.tms.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateShipmentInput {
    // Shipper Information
    @NotBlank(message = "Shipper name is required")
    private String shipperName;

    @NotBlank(message = "Shipper phone is required")
    private String shipperPhone;

    private String shipperEmail;

    @NotBlank(message = "Shipper address is required")
    private String shipperAddress;

    @NotBlank(message = "Shipper city is required")
    private String shipperCity;

    @NotBlank(message = "Shipper state is required")
    private String shipperState;

    @NotBlank(message = "Shipper zip is required")
    private String shipperZip;

    // Consignee Information
    @NotBlank(message = "Consignee name is required")
    private String consigneeName;

    @NotBlank(message = "Consignee phone is required")
    private String consigneePhone;

    private String consigneeEmail;

    @NotBlank(message = "Consignee address is required")
    private String consigneeAddress;

    @NotBlank(message = "Consignee city is required")
    private String consigneeCity;

    @NotBlank(message = "Consignee state is required")
    private String consigneeState;

    @NotBlank(message = "Consignee zip is required")
    private String consigneeZip;

    // Cargo Information
    @NotBlank(message = "Cargo description is required")
    private String cargoDescription;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;

    private String dimensions;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    // Financial
    @NotNull(message = "Estimated rate is required")
    @Positive(message = "Estimated rate must be positive")
    private Double estimatedRate;

    private String currency = "USD";

    // Dates
    @NotNull(message = "Pickup date is required")
    private LocalDate pickupDate;

    @NotNull(message = "Estimated delivery is required")
    private LocalDate estimatedDelivery;

    private String notes;
}
