
//First Commit
package com.ecobazaar.ecobazaar.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String role;
    private int age;
    private Integer ecoScore;

    @Column(nullable = false)
    private String password;

    // ✅ No-args constructor required by JPA & Jackson
    public User() {}

    // Optional convenience constructor
    public User(Long id, String name, String email, String phone, String role, int age, int ecoScore, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.age = age;
        this.ecoScore = ecoScore;
        this.password = password;
    }

    // ✅ Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Integer getEcoScore() { return ecoScore; }
    public void setEcoScore(Integer ecoScore) { this.ecoScore = ecoScore; }
}
