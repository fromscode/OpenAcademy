package com.openacademy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.openacademy.backend.entity.Teacher;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

}
