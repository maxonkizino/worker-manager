package com.taskflow.optimization.security;

public final class RequestUserContext {

    private static final ThreadLocal<RequestUser> CURRENT = new ThreadLocal<>();

    private RequestUserContext() {}

    public static void set(RequestUser user) {
        CURRENT.set(user);
    }

    public static RequestUser get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }
}
