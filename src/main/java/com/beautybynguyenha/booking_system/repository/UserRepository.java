package com.beautybynguyenha.booking_system.repository;

import com.beautybynguyenha.booking_system.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Used for Login and Forgot Password
    Optional<User> findByEmail(String email);

    // Used for Admin's "Team Management" list
    // This will return everyone where role is "STAFF"
    List<User> findByRole(String role);

    // Used to check if an email exists during signup to prevent duplicates
    Boolean existsByEmail(String email);

    // Used for the Forgot Password flow
    Optional<User> findByResetToken(String resetToken);
}