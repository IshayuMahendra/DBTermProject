package pollappbackend.controllers;


import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pollappbackend.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // DTO for incoming JSON
    public static class RegisterRequest {
        public String username;
        public String password;
        public String displayName;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest req) {
        if (req.username == null || req.username.isBlank()
                || req.password == null || req.password.isBlank()
                || req.displayName == null || req.displayName.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("All fields are required.");
        }

        if (userService.usernameExists(req.username)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Username already exists.");
        }

        userService.createUser(req.username, req.password, req.displayName);

        return ResponseEntity.ok("User registered successfully.");
    }

    // DTO for incoming JSON
    public static class LoginRequest {
        public String username;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.username == null || req.username.isBlank()
                || req.password == null || req.password.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Username and password are required.");
        }

        boolean ok = userService.validateLogin(req.username, req.password);

        if (!ok) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");
        }

        var user = userService.getUserByUsername(req.username);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("User record not found after login.");
        }

        LoginResponse resp = new LoginResponse();
        resp.userId = user.getUserId();
        resp.username = user.getUsername();
        resp.displayName = user.getDisplayName();

        return ResponseEntity.ok(resp);
    }

    public static class LoginResponse {
        public Integer userId;
        public String username;
        public String displayName;
    } // LoginResponse
    
    public static class UpdatePasswordRequest {
        public Integer userId;
        public String oldPassword;
        public String newPassword;
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequest req) {
        if (req.userId == null ||
            req.oldPassword == null || req.oldPassword.isBlank() ||
            req.newPassword == null || req.newPassword.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "All fields are required."));
        }

        boolean updated = userService.updatePassword(
                req.userId,
                req.oldPassword,
                req.newPassword
        );

        if (!updated) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Current password is incorrect or user not found."));
        }

        return ResponseEntity.ok(
                Map.of("message", "Password updated successfully.")
        );
    }


} // AuthController
