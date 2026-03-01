package com.autoloan.backend.config;

import com.autoloan.backend.security.ScopesGuard;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final ScopesGuard scopesGuard;

    public WebConfig(ScopesGuard scopesGuard) {
        this.scopesGuard = scopesGuard;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(scopesGuard).addPathPatterns("/api/**");
    }
}
