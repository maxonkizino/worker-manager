package com.taskflow.user.repository;

import com.taskflow.user.domain.WorkSchedule;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, UUID> {

    Optional<WorkSchedule> findByNameIgnoreCase(String name);

    @Query("select distinct s from WorkSchedule s left join fetch s.days where s.id = :id")
    Optional<WorkSchedule> findDetailedById(@Param("id") UUID id);
}
