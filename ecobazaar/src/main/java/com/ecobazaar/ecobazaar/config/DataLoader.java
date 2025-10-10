package com.ecobazaar.ecobazaar.config;

import com.ecobazaar.ecobazaar.model.User;
import com.ecobazaar.ecobazaar.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component   // Spring will detect this automatically
public class DataLoader implements CommandLineRunner {

    private final UserRepository repo;

    public DataLoader(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repo.count() == 0) {   // only insert if empty
            User u = new User(null, "Bob", "Bob123@example.com","ssmb29", "USER", 49,3,"as29yruiwbcvsb");
            repo.save(u);
            System.out.println("✅ User inserted into DB");
        }
    }
}
