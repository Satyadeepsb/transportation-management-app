package com.transport.tms.dto.input;

import com.transport.tms.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserInput {
    @NotBlank(message = "ID is required")
    private String id;

    @Email(message = "Invalid email format")
    private String email;

    private String firstName;
    private String lastName;
    private UserRole role;
    private String phone;
    private Boolean isActive;
}
