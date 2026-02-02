package com.transport.tms.dto;

import com.transport.tms.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedUsers {
    private List<User> data;
    private PaginationMeta meta;
}
