package com.subsentry.repository;

import com.subsentry.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    void delete(String id);
    boolean exists(String id);
}