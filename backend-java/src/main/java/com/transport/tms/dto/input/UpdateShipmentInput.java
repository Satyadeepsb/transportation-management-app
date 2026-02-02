package com.transport.tms.dto.input;

import com.transport.tms.model.ShipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateShipmentInput {
    @NotBlank(message = "ID is required")
    private String id;

    private ShipmentStatus status;

    @Positive(message = "Actual rate must be positive")
    private Double actualRate;

    private LocalDate deliveryDate;
    private String notes;
}
