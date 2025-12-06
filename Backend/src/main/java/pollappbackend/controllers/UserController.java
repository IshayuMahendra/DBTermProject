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

} // UserController
