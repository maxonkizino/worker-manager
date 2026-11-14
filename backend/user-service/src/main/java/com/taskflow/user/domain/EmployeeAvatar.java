package com.taskflow.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "employee_avatars")
@Getter
@Setter
public class EmployeeAvatar {

    @Id
    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "content_type", nullable = false, length = 64)
    private String contentType;

    @Column(nullable = false)
    private byte[] data;

    @Column(name = "original_content_type", length = 64)
    private String originalContentType;

    @Column(name = "original_data")
    private byte[] originalData;

    @Column(name = "crop_zoom")
    private Double cropZoom;

    @Column(name = "crop_offset_x")
    private Double cropOffsetX;

    @Column(name = "crop_offset_y")
    private Double cropOffsetY;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
