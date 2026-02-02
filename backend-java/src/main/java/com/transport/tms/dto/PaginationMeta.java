package com.transport.tms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaginationMeta {
    private Integer total;
    private Integer page;
    private Integer limit;
    private Integer totalPages;
    private Boolean hasNextPage;
    private Boolean hasPreviousPage;
}
