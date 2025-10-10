package com.ecobazaar.ecobazaar.service;

import com.ecobazaar.ecobazaar.model.User;
import com.ecobazaar.ecobazaar.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service  // tells Spring: this is a service class
public class UserService {

    private final UserRepository userRepository;

    // constructor injection (best practice)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Method to create new user
    public User createUser(User user) {
        return userRepository.save(user); // saves into DB
    }

    // Method to get all users
    public List<User> getAllUsers() {
        return userRepository.findAll(); // fetches from DB
    }
}
