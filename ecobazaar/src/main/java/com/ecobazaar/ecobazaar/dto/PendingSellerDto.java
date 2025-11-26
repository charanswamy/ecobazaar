// PendingSellerDto.java
package com.ecobazaar.ecobazaar.dto;

public record PendingSellerDto(
    Long id,
    String name,
    String email,
    int productCount
) {}