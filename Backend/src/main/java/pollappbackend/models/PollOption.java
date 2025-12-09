package pollappbackend.models;

public class PollOption {

    private int optionId;
    private int pollId;
    private String text;
    private int votes;

    // getters and setters
    
    public Integer getOptionId() {
        return optionId;
    } // getOptionId

    public void setOptionId(Integer optionId) {
        this.optionId = optionId;
    } // setOptionId

    public Integer getPollId() {
        return pollId;
    } // getPollId

    public void setPollId(Integer pollId) {
        this.pollId = pollId;
    } // setPollId

    public String getText() {
        return text;
    } // getText

    public void setText(String text) {
        this.text = text;
    } // setText

    public Integer getVotes() {
        return votes;
    } // getVotes

    public void setVotes(Integer votes) {
        this.votes = votes;
    } // setVotes
    
} // PollOption
