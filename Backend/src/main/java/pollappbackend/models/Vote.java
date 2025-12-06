package pollappbackend.models;

import java.security.Timestamp;

public class Vote {

    private Integer voteId;
    private Integer userId;
    private Integer pollId;
    private Integer optionId;
    private Timestamp votedAt;

    public Integer getVoteId() {
        return voteId;
    } // getVotedId

    public void setVoteId(Integer voteId) {
        this.voteId = voteId;
    } // setVotedId

    public Integer getUserId() {
        return userId;
    } // getUserId

    public void setUserId(Integer userId) {
        this.userId = userId;
    } // setUserId

    public Integer getPollId() {
        return pollId;
    } // getPollId

    public void setPollId(Integer pollId) {
        this.pollId = pollId;
    } // setPollId

    public Integer getOptionId() {
        return optionId;
    } // getOptionId

    public void setOptionId(Integer optionId) {
        this.optionId = optionId;
    } // setOptionId

    public Timestamp getVotedAt() {
        return votedAt;
    } // getVotedAt

    public void setVotedAt(Timestamp votedAt) {
        this.votedAt = votedAt;
    } // setVotedAt

} // Vote
