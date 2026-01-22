package com.beautybynguyenha.booking_system.repository;

import com.beautybynguyenha.booking_system.entity.BeautyService;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BeautyServiceRepository extends MongoRepository<BeautyService, String> {
}