package com.taskflow.task.security;

import java.util.Collection;
import java.util.UUID;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

@Getter
public class TaskFlowUser extends User {

  private final UUID userId;

  public TaskFlowUser(UUID userId, Collection<? extends GrantedAuthority> authorities) {
    super(userId.toString(), "N/A", authorities);
    this.userId = userId;
  }
}
