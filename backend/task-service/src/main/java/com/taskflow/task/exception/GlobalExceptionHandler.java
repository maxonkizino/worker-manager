package com.taskflow.task.exception;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<Map<String, Object>> notFound(NotFoundException ex) {
    return problem(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler({ConflictException.class, org.springframework.orm.ObjectOptimisticLockingFailureException.class})
  public ResponseEntity<Map<String, Object>> conflict(RuntimeException ex) {
    return problem(HttpStatus.CONFLICT, ex.getMessage());
  }

  @ExceptionHandler({BadRequestException.class, InvalidStatusTransitionException.class, IllegalArgumentException.class})
  public ResponseEntity<Map<String, Object>> badRequest(RuntimeException ex) {
    return problem(HttpStatus.BAD_REQUEST, ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .orElse("Validation failed");
    return problem(HttpStatus.BAD_REQUEST, message);
  }

  private ResponseEntity<Map<String, Object>> problem(HttpStatus status, String message) {
    return ResponseEntity.status(status)
        .body(
            Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message));
  }
}
