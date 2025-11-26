
package com.ecobazaar.ecobazaar.repository;

import com.ecobazaar.ecobazaar.model.AdminRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminRequestRepository extends JpaRepository<AdminRequest, Long> {
 List<AdminRequest> findByApprovedFalseAndRejectedFalseOrderByRequestedAtDesc();
 boolean existsByUserIdAndApprovedFalseAndRejectedFalse(Long userId);
 
 long countByApprovedFalseAndRejectedFalse();
}