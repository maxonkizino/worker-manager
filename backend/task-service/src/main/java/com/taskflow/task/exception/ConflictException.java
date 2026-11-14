package com.taskflow.task.exception;

public class ConflictException extends RuntimeException {
  public ConflictException(String message) {
    super(message);
  }
}
