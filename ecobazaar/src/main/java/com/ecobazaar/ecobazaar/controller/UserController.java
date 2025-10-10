package com.ecobazaar.ecobazaar.controller;
import org.springframework.web.bind.annotation.*;
import com.ecobazaar.ecobazaar.model.User;
import com.ecobazaar.ecobazaar.service.UserService;

import java.util.List;

@RestController  // makes this class handle HTTP requests
@RequestMapping("/users")  // base URL: /users
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /users → create user
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // GET /users → fetch all users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
}
