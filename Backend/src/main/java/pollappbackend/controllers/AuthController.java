package pollappbackend.controllers;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pollappbackend.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    } // AuthController

    // DTO for incoming JSON
    public static class RegisterRequest {
        public String username;
        public String password;
        public String displayName;

        // getters/setters (optional for now since fields are public)
    } // RegisterRequest

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

        // TODO: hash password before saving
        userService.createUser(req.username, req.password, req.displayName);

        return ResponseEntity.ok("User registered successfully.");
    } // register

    // DTO for incoming JSON
    public static class LoginRequest {
        public String username;
        public String password;
    } // LoginRequest

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
        } // if

        LoginResponse resp = new LoginResponse();
        resp.userId = user.getUserId();
        resp.username = user.getUsername();
        resp.displayName = user.getDisplayName();

        return ResponseEntity.ok(resp);
    } // login

    public static class LoginResponse {
        public Integer userId;
        public String username;
        public String displayName;
    } // LoginResponse
    
} // AuthController
