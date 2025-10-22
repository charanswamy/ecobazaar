package com.ecobazaar.ecobazaar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecobazaar.ecobazaar.model.CartItem;

public interface CartRepository extends JpaRepository<CartItem, Long> {
	
	List<CartItem> findByUserId(Long id);

}
