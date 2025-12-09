package pollappbackend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pollappbackend.services.VoteService;

@RestController
@RequestMapping("/api/polls")
public class VoteController {
    
    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    } // VoteController

    public static class VoteRequest {
        public Integer userId;
        public Integer optionId;
    } // VoteRequest

    @PostMapping("/{pollId}/vote")
    public ResponseEntity<String> vote(@PathVariable int pollId,
                                       @RequestBody VoteRequest req) {

        if (req.userId == null || req.optionId == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("userId and optionId are required.");
        } // if

        // Check if user already voted in this poll
        if (voteService.hasUserVoted(pollId, req.userId)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("User has already voted in this poll.");
        } // if

        boolean ok = voteService.castVote(pollId, req.optionId, req.userId);

        if (!ok) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to record vote.");
        } // if

        return ResponseEntity.ok("Vote recorded.");
    } // vote

} // VoteController
