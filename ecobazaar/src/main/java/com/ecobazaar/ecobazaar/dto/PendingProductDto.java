
package com.ecobazaar.ecobazaar.dto;

public record PendingProductDto(
    Long id,
    String name,
    double price,
    Double carbonImpact,
    String sellerName
) {}