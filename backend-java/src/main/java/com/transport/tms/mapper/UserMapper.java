package com.transport.tms.mapper;

import com.transport.tms.dto.input.CreateUserInput;
import com.transport.tms.dto.input.RegisterInput;
import com.transport.tms.dto.input.UpdateUserInput;
import com.transport.tms.model.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Map RegisterInput to User entity
     * Note: Password should be encoded separately before saving
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // Will be set after encoding
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(RegisterInput input);

    /**
     * Map CreateUserInput to User entity
     * Note: Password should be encoded separately before saving
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // Will be set after encoding
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(CreateUserInput input);

    /**
     * Update existing User entity from UpdateUserInput
     * Only updates non-null fields
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // Never update password through this method
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromInput(UpdateUserInput input, @MappingTarget User user);
}
