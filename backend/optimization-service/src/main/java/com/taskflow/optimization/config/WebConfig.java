package com.taskflow.optimization.config;

import com.taskflow.optimization.security.HeaderAuthFilter;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WebConfig {

    @Bean
    FilterRegistrationBean<HeaderAuthFilter> headerAuthFilterRegistration(HeaderAuthFilter filter) {
        FilterRegistrationBean<HeaderAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/api/*");
        registration.setOrder(1);
        return registration;
    }

    @Bean
    RestTemplate restTemplate(RestTemplateBuilder builder, TaskflowServiceProperties properties) {
        return builder
                .connectTimeout(properties.getHttpConnectTimeout())
                .readTimeout(properties.getHttpReadTimeout())
                .build();
    }
}
