package com.taskflow.user.repository;

import com.taskflow.user.domain.NonWorkingDay;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NonWorkingDayRepository extends JpaRepository<NonWorkingDay, UUID> {

    boolean existsByDate(LocalDate date);
}
