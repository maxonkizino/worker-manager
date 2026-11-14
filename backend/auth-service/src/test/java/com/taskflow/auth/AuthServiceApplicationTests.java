package com.taskflow.auth;

import com.taskflow.auth.support.PostgresContainerSupport;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceApplicationTests extends PostgresContainerSupport {

    @Test
    void contextLoads() {
    }
}
