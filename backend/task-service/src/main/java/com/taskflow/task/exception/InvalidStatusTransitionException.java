package com.taskflow.task.exception;

public class InvalidStatusTransitionException extends RuntimeException {
  public InvalidStatusTransitionException(String message) {
    super(message);
  }
}
