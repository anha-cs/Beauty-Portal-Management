package com.beautybynguyenha.booking_system.repository;

import com.beautybynguyenha.booking_system.entity.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    // -------------------------
    // BLOCKS: isBlock=true OR status=BLOCKED
    // -------------------------
    @Query("{ $or: [ { 'isBlock': true }, { 'status': 'BLOCKED' } ] }")
    List<Appointment> findBlocks();

    @Query("{ 'staffId': ?0, $or: [ { 'isBlock': true }, { 'status': 'BLOCKED' } ] }")
    List<Appointment> findBlocksByStaffId(String staffId);

    // -------------------------
    // RECORDS: NOT blocked
    // = isBlock != true AND status != BLOCKED
    // -------------------------
    @Query("{ $and: [ { 'isBlock': { $ne: true } }, { 'status': { $ne: 'BLOCKED' } } ] }")
    List<Appointment> findRecordsAll();

    @Query("{ 'staffId': ?0, $and: [ { 'isBlock': { $ne: true } }, { 'status': { $ne: 'BLOCKED' } } ] }")
    List<Appointment> findRecordsByStaffId(String staffId);

    @Query("{ 'customerId': ?0, $and: [ { 'isBlock': { $ne: true } }, { 'status': { $ne: 'BLOCKED' } } ] }")
    List<Appointment> findRecordsByCustomerId(String customerId);
}
