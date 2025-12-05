package pollappbackend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import pollappbackend.services.UserService;

@RestController
public class UserController {
     private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // TEST to make sure Backend is connecting to SQL database 
    // GET http://localhost:8081/api/users/count  should say 0(table is currently empty)
    @GetMapping("/api/users/count")
    public int getUserCount() {
        return userService.countUsers();
    }
} // UserController
