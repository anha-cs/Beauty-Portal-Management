package com.beautybynguyenha.booking_system.config;

import com.beautybynguyenha.booking_system.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value; // Required for variable injection
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final AuthTokenFilter authTokenFilter;

    // Injects the frontend URL from application.yml
    @Value("${app.frontend.url}")
    private String frontendUrl;

    public SecurityConfig(CustomUserDetailsService userDetailsService, AuthTokenFilter authTokenFilter) {
        this.userDetailsService = userDetailsService;
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Pre-flight (Must be first)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Auth Endpoints
                        .requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/**").permitAll()

                        // 3. Static Resources
                        .requestMatchers("/", "/index.html", "/*.js", "/*.css", "/*.png", "/*.jpg", "/*.ico", "/*.json", "/assets/**").permitAll()

                        // 4. Public API data
                        .requestMatchers("/api/staff/all", "/api/appointments/all", "/api/services/all").permitAll()

                        // 5. Protected (Admin & Auth)
                        .requestMatchers("/api/staff/admin/**", "/api/services/add", "/api/services/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/appointments/book", "/api/staff/me").authenticated()

                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(frontendUrl, "https://www.beautybynguyenha.com",
                "https://beautybynguyenha.com"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}