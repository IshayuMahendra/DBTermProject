package pollappbackend.controllers;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pollappbackend.services.PollService;
import pollappbackend.models.Poll;
import pollappbackend.models.PollOption;
import java.util.List;

@RestController
@RequestMapping("/api/polls")
public class PollController {
    
    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    } // PollControll
    
    public static class CreatePollRequest {
        public String title;
        public Integer creatorId;   
        public String imageId;      
        public List<String> options;
    } // CreatePollRequest

    @PostMapping
    public ResponseEntity<?> createPoll(@RequestBody CreatePollRequest req) {

        if (req.title == null || req.title.isBlank()
                || req.creatorId == null
                || req.options == null || req.options.size() < 2) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Title, creatorId, and at least 2 options are required.");
        } // if

        int pollId = pollService.createPoll(
                req.title,
                req.creatorId,
                req.imageId,       // may be null
                req.options
        );

        if (pollId == -1) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create poll.");
        } // if

        // new poll id as JSON
        return ResponseEntity.ok("{\"pollId\": " + pollId + "}");

    } // createPoll

    public static class PollResponse {
        public Poll poll;
        public List<PollOption> options;
    } // PollResponse

    @GetMapping("/{pollId}")
    public ResponseEntity<?> getPoll(@PathVariable int pollId) {
        Poll poll = pollService.getPollById(pollId);
        if (poll == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Poll not found");
        }

        List<PollOption> options = pollService.getOptionsForPoll(pollId);

        PollResponse resp = new PollResponse();
        resp.poll = poll;
        resp.options = options;

        return ResponseEntity.ok(resp);
    } // getPoll

    @GetMapping
    public ResponseEntity<List<Poll>> getAllPolls() {
        List<Poll> polls = pollService.getAllPolls();
        return ResponseEntity.ok(polls);
    } // getAllPolls

} // PollCOntroller
