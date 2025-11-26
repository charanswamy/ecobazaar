package com.ecobazaar.ecobazaar.repository;

import com.ecobazaar.ecobazaar.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByEcoCertifiedTrue();
    List<Product> findByEcoCertifiedTrueOrderByCarbonImpactAsc();
    Optional<Product> findFirstByEcoCertifiedTrueAndNameContainingIgnoreCase(String namePart);
    List<Product> findByEcoRequestedTrue();

    // CORRECT METHOD NAME FOR JPA RELATIONSHIP
    List<Product> findBySeller_Id(Long sellerId);
}