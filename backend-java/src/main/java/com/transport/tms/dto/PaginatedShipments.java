package com.transport.tms.dto;

import com.transport.tms.model.Shipment;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PaginatedShipments {
    private List<Shipment> data;
    private PaginationMeta meta;
}
