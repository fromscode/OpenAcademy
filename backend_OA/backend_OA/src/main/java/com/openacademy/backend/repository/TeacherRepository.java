package com.openacademy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.openacademy.backend.entities.Teacher;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

}
