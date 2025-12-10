package pollappbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()  // Allow register/login
                .requestMatchers("/api/polls/**").permitAll()  // Allow polls/votes
                .requestMatchers("/api/stats/**").permitAll()  // Allow stats
                .anyRequest().authenticated()  // Secure others
            )
            .csrf(csrf -> csrf.disable())  // Disable CSRF for API (stateless)
            .httpBasic(withDefaults -> {});  // Optional: Keep basic auth for admin

        return http.build();
    }
}