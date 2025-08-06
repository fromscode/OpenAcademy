package com.openacademy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.openacademy.backend.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

}
