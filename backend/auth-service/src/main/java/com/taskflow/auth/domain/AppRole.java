package com.taskflow.auth.domain;

public enum AppRole {
    ROLE_ADMIN,
    ROLE_MANAGER,
    ROLE_EMPLOYEE;

    public static boolean isValid(String value) {
        for (AppRole role : values()) {
            if (role.name().equals(value)) {
                return true;
            }
        }
        return false;
    }
}
