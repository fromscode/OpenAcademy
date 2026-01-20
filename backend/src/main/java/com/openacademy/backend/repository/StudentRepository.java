package com.openacademy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.openacademy.backend.entities.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

}
