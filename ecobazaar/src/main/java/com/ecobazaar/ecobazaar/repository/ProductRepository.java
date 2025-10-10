package com.ecobazaar.ecobazaar.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ecobazaar.ecobazaar.model.Product;
public interface ProductRepository extends JpaRepository<Product, Long> {

// later we can add custom queries here if needed

}