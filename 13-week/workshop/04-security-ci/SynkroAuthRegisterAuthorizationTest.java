package co.edu.corhuila.synkro.auth.app;

import co.edu.corhuila.synkro.auth.adapter.out.crypto.Rs256TokenVerifier;
import co.edu.corhuila.synkro.auth.application.port.out.AccessTokenVerifier;
import co.edu.corhuila.synkro.auth.application.port.out.IdGenerator;
import co.edu.corhuila.synkro.auth.application.port.out.PasswordHasher;
import co.edu.corhuila.synkro.auth.application.port.out.RegistrationAttemptLog;
import co.edu.corhuila.synkro.auth.application.port.out.UserRegistrationStore;
import co.edu.corhuila.synkro.auth.application.port.out.UserRepository;
import co.edu.corhuila.synkro.auth.application.usecase.GetUserUseCase;
import co.edu.corhuila.synkro.auth.application.usecase.RegisterUserUseCase;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, SynkroAuthRegisterAuthorizationTest.RealPolicy.class})
class SynkroAuthRegisterAuthorizationTest {

    private static final KeyPair KEYS = newKeys();

    @Autowired MockMvc http;
    @Autowired ObjectMapper json;

    @MockitoBean UserRepository users;
    @MockitoBean UserRegistrationStore registrations;
    @MockitoBean PasswordHasher passwords;
    @MockitoBean IdGenerator ids;
    @MockitoBean RegistrationAttemptLog attempts;
    @MockitoBean GetUserUseCase getUser;

    @Test
    void synkroAuthApi_postApiV1AuthRegister_salespersonGets403WithoutPersistence()
            throws Exception {
        String subject = UUID.randomUUID().toString();
        Instant now = Instant.now();
        String token = Jwts.builder()
            .subject(subject)
            .id(UUID.randomUUID().toString())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(300)))
            .claim("roles", List.of("SALESPERSON"))
            .claim("permissions", List.of())
            .signWith(KEYS.getPrivate(), Jwts.SIG.RS256)
            .compact();

        String body = json.writeValueAsString(Map.of(
            "name", "Workshop Test",
            "email", "new-admin@example.test",
            "password", UUID.randomUUID().toString(),
            "role", "ADMIN"
        ));

        http.perform(post("/api/v1/auth/register")
                .header("Authorization", "Bearer " + token)
                .header("Idempotency-Key", "cp4-" + UUID.randomUUID())
                .header("X-Correlation-Id", "cp4-register-denied")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error").value("FORBIDDEN"))
            .andExpect(jsonPath("$.traceId").value("cp4-register-denied"));

        verify(attempts).rejected(
            "cp4-register-denied", subject, RegistrationAttemptLog.Reason.FORBIDDEN);
        verifyNoInteractions(users, registrations, passwords, ids, getUser);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class RealPolicy {
        @Bean
        AccessTokenVerifier verifier() {
            return new Rs256TokenVerifier(KEYS.getPublic(), Clock.systemUTC());
        }

        @Bean
        RegisterUserUseCase registerUser(
                UserRepository users, UserRegistrationStore registrations,
                PasswordHasher passwords, IdGenerator ids,
                RegistrationAttemptLog attempts) {
            return new RegisterUserUseCase(
                users, registrations, passwords, ids, Clock.systemUTC(), attempts);
        }
    }

    private static KeyPair newKeys() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot generate temporary test keys", e);
        }
    }
}