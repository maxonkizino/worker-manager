package com.taskflow.user.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CapacityRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public BigDecimal sumCapacityHours(UUID employeeId, LocalDate from, LocalDate to) {
        var params = new MapSqlParameterSource()
                .addValue("employeeId", employeeId)
                .addValue("from", from)
                .addValue("to", to);
        BigDecimal sum = jdbc.queryForObject(
                """
                        SELECT COALESCE(SUM(capacity_hours), 0)
                        FROM employee_daily_capacity(:from, :to)
                        WHERE employee_id = :employeeId
                        """,
                params,
                BigDecimal.class);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public Map<UUID, BigDecimal> sumCapacityHoursBatch(Collection<UUID> employeeIds, LocalDate from, LocalDate to) {
        if (employeeIds == null || employeeIds.isEmpty()) {
            return Map.of();
        }
        var params = new MapSqlParameterSource()
                .addValue("employeeIds", employeeIds)
                .addValue("from", from)
                .addValue("to", to);
        Map<UUID, BigDecimal> result = new HashMap<>();
        jdbc.query(
                """
                        SELECT employee_id, COALESCE(SUM(capacity_hours), 0) AS total
                        FROM employee_daily_capacity(:from, :to)
                        WHERE employee_id IN (:employeeIds)
                        GROUP BY employee_id
                        """,
                params,
                rs -> {
                    result.put(
                            UUID.fromString(rs.getString("employee_id")),
                            rs.getBigDecimal("total"));
                });
        for (UUID id : employeeIds) {
            result.putIfAbsent(id, BigDecimal.ZERO);
        }
        return result;
    }
}
